import { allowedUserTypes } from '@@constants';
import { AllowedUserTypes } from '@@types';
import jwt from 'jsonwebtoken';
import { NotFoundError, UnauthorizedError } from '@@errors';
import { IAdmin, IUser } from '@@interfaces';
import { UserHelper } from './user.helper';
import { AdminHelper } from './admin.helper';

interface TokenOptions {
  refreshTokenKey: string;
  accessTokenKey: string;
  expiry: string;
  refreshExpiry: string;
}

interface TokenPayload {
  isAdmin: boolean;
  id: string;
  role: string;
}

const jwtOptions = {
  algorithms: ['HS256'],
};

export default class TokenHelper {
  userType: AllowedUserTypes;

  options: TokenOptions;

  constructor(userType?: AllowedUserTypes) {
    this.userType =
      userType || (allowedUserTypes.CUSTOMER as AllowedUserTypes);
    this.options = this.getOptions();
  }

  private getOptions(): TokenOptions {
    if (this.userType === allowedUserTypes.ADMIN) {
      return {
        accessTokenKey: process.env.JWT_ADMIN_KEY as string,
        refreshTokenKey: process.env.JWT_REFRESH_ADMIN_KEY as string,
        expiry: process.env.JWT_ADMIN_EXPIRY as string,
        refreshExpiry: process.env.JWT_ADMIN_REFRESH_EXPIRY as string,
      };
    }
    return {
      accessTokenKey: process.env.JWT_KEY as string,
      refreshTokenKey: process.env.JWT_REFRESH_KEY as string,
      expiry: process.env.JWT_EXPIRY as string,
      refreshExpiry: process.env.JWT_REFRESH_EXPIRY as string,
    };
  }

  async getActiveUserById(
    id: string,
  ): Promise<IUser | IAdmin | null> {
    if (this.userType === allowedUserTypes.ADMIN) {
      return AdminHelper.getActiveAdminById(id);
    }
    return UserHelper.getActiveUserById(id);
  }

  getAccessToken(payload: TokenPayload) {
    return jwt.sign(payload, this.options.accessTokenKey, {
      algorithm: 'HS256',
      expiresIn: this.options.accessTokenKey,
    });
  }

  getRefreshToken(payload: TokenPayload) {
    return jwt.sign(payload, this.options.refreshTokenKey, {
      algorithm: 'HS256',
      expiresIn: this.options.refreshExpiry,
    });
  }

  createTokens(id: string) {
    const user = this.getActiveUserById(id);

    if (!user) {
      throw new NotFoundError('User not found!');
    }

    const payload = {
      isAdmin: this.userType === allowedUserTypes.ADMIN,
      id: (user as any)._id,
      role: (user as any)?.roleId,
    };

    return {
      accessToken: this.getAccessToken(payload),
      refreshToken: this.getRefreshToken(payload),
    };
  }

  verifyAndDecodeAccessToken(accessToken: string) {
    try {
      return jwt.verify(accessToken, this.options.accessTokenKey, {
        algorithms: ['HS256'],
      });
    } catch (err) {
      if ((err as any)?.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Session expired.', {
          redirect: true,
        });
      }

      throw new UnauthorizedError('Unautorized request');
    }
  }

  async createAccessToken(
    refreshToken: string,
  ): Promise<string | undefined> {
    try {
      const decoded: any = jwt.verify(
        refreshToken,
        this.options.refreshTokenKey,
        {
          algorithms: ['HS256'],
        },
      );

      const user = await this.getActiveUserById(decoded.id);

      if (!user) {
        throw new NotFoundError('User not found!');
      }

      return this.getAccessToken({
        isAdmin: this.userType === allowedUserTypes.ADMIN,
        id: user._id,
        role: (user as any)?.roleId,
      });
    } catch (err) {
      if ((err as any)?.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Session expired.', {
          redirect: true,
        });
      }

      throw new UnauthorizedError('Unautorized request');
    }
  }

  async createRefreshToken(userId: string) {
    const user = await this.getActiveUserById(userId);
    if (!user) {
      throw new NotFoundError('No active users found!');
    }

    return this.getRefreshToken({
      isAdmin: this.userType === allowedUserTypes.ADMIN,
      id: user._id,
      role: (user as any).roleId,
    });
  }
}
