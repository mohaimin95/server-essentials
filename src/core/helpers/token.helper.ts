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
  role?: string;
  phoneConfirmedAt?: string;
  emailConfirmedAt?: string;
}

export default class TokenHelper {
  private userType: AllowedUserTypes;

  private options: TokenOptions;

  constructor(
    userType: AllowedUserTypes = (allowedUserTypes as any).CUSTOMER,
  ) {
    this.userType = userType;
    this.options = this.getOptions();
  }

  private getOptions(): TokenOptions {
    const {
      JWT_KEY,
      JWT_REFRESH_KEY,
      JWT_EXPIRY,
      JWT_REFRESH_EXPIRY,
      JWT_ADMIN_KEY,
      JWT_REFRESH_ADMIN_KEY,
      JWT_ADMIN_EXPIRY,
      JWT_ADMIN_REFRESH_EXPIRY,
    } = process.env;

    if (this.userType === allowedUserTypes.ADMIN) {
      if (
        !JWT_ADMIN_KEY ||
        !JWT_REFRESH_ADMIN_KEY ||
        !JWT_ADMIN_EXPIRY ||
        !JWT_ADMIN_REFRESH_EXPIRY
      ) {
        throw new Error('Missing JWT admin environment variables.');
      }

      return {
        accessTokenKey: JWT_ADMIN_KEY,
        refreshTokenKey: JWT_REFRESH_ADMIN_KEY,
        expiry: JWT_ADMIN_EXPIRY,
        refreshExpiry: JWT_ADMIN_REFRESH_EXPIRY,
      };
    }

    if (
      !JWT_KEY ||
      !JWT_REFRESH_KEY ||
      !JWT_EXPIRY ||
      !JWT_REFRESH_EXPIRY
    ) {
      throw new Error('Missing JWT environment variables.');
    }

    return {
      accessTokenKey: JWT_KEY,
      refreshTokenKey: JWT_REFRESH_KEY,
      expiry: JWT_EXPIRY,
      refreshExpiry: JWT_REFRESH_EXPIRY,
    };
  }

  private async getActiveUserById(
    id: string,
  ): Promise<IUser | IAdmin | null> {
    return this.userType === allowedUserTypes.ADMIN
      ? AdminHelper.getActiveAdminById(id)
      : UserHelper.getActiveUserById(id);
  }

  static createToken(
    payload: TokenPayload,
    key: string,
    expiry: string,
  ): string {
    return jwt.sign(payload, key, {
      algorithm: 'HS256',
      expiresIn: expiry,
    });
  }

  static async verifyToken(
    token: string,
    key: string,
  ): Promise<TokenPayload> {
    try {
      return jwt.verify(token, key, {
        algorithms: ['HS256'],
      }) as TokenPayload;
    } catch (err) {
      if (
        (err as jwt.JsonWebTokenError)?.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedError('Session expired.', {
          redirect: true,
        });
      }
      throw new UnauthorizedError('Unauthorized request');
    }
  }

  async createTokens(
    id: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user: any = await this.getActiveUserById(id);
    if (!user) throw new NotFoundError('User not found!');

    const payload: TokenPayload = {
      isAdmin: this.userType === allowedUserTypes.ADMIN,
      id: (user as any)._id,
    };

    return {
      accessToken: TokenHelper.createToken(
        {
          ...payload,
          role:
            this.userType === allowedUserTypes.CUSTOMER
              ? (user as any)?.roleId
              : undefined,
          emailConfirmedAt:
            this.userType === allowedUserTypes.CUSTOMER
              ? (user.emailConfirmedAt as string)
              : undefined,
          phoneConfirmedAt:
            this.userType === allowedUserTypes.CUSTOMER
              ? (user.phoneConfirmedAt as string)
              : undefined,
        },
        this.options.accessTokenKey,
        this.options.expiry,
      ),
      refreshToken: TokenHelper.createToken(
        payload,
        this.options.refreshTokenKey,
        this.options.refreshExpiry,
      ),
    };
  }

  async verifyAccessToken(
    accessToken: string,
  ): Promise<TokenPayload> {
    return TokenHelper.verifyToken(
      accessToken,
      this.options.accessTokenKey,
    );
  }

  async createAccessToken(refreshToken: string): Promise<string> {
    const decodedPayload = await TokenHelper.verifyToken(
      refreshToken,
      this.options.refreshTokenKey,
    );
    const user = await this.getActiveUserById(decodedPayload.id);
    if (!user) throw new NotFoundError('User not found!');

    const payload: TokenPayload = {
      isAdmin: this.userType === allowedUserTypes.ADMIN,
      id: user._id,
      role: (user as any)?.roleId,
    };

    return TokenHelper.createToken(
      payload,
      this.options.accessTokenKey,
      this.options.expiry,
    );
  }

  async createRefreshToken(userId: string): Promise<string> {
    const user = await this.getActiveUserById(userId);
    if (!user) throw new NotFoundError('No active users found!');

    const payload: TokenPayload = {
      isAdmin: this.userType === allowedUserTypes.ADMIN,
      id: user._id,
      role: (user as any).roleId,
    };

    return TokenHelper.createToken(
      payload,
      this.options.refreshTokenKey,
      this.options.refreshExpiry,
    );
  }
}
