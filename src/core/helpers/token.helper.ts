import { allowedUserTypes } from '@@constants';
import { AllowedUserTypes } from '@@types';
import jwt from 'jsonwebtoken';
import { NotFoundError, UnauthorizedError } from '@@errors';
import { IAdmin, IUser } from '@@interfaces';
import { redisClient } from '@@utils';
import UserHelper from './user.helper';
import AdminHelper from './admin.helper';
import SessionHelper from './session.helper';

interface TokenOptions {
  refreshTokenKey: string;
  authTokenKey: string;
  expiry: string;
  refreshExpiry: string;
}

interface TokenPayload {
  session: string;
  isAdmin: boolean;
  _id: string;
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
        authTokenKey: JWT_ADMIN_KEY,
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
      authTokenKey: JWT_KEY,
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
  ): Promise<{ authToken: string; refreshToken: string }> {
    const user: any = await this.getActiveUserById(id);
    if (!user) throw new NotFoundError('User not found!');

    const session = await SessionHelper.createSession(user._id);

    const payload: TokenPayload = {
      session: session._id.toString(),
      isAdmin: this.userType === allowedUserTypes.ADMIN,
      _id: (user as any)._id,
    };

    return {
      authToken: TokenHelper.createToken(
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
        this.options.authTokenKey,
        this.options.expiry,
      ),
      refreshToken: TokenHelper.createToken(
        payload,
        this.options.refreshTokenKey,
        this.options.refreshExpiry,
      ),
    };
  }

  async verifyAccessToken(authToken: string): Promise<TokenPayload> {
    return TokenHelper.verifyToken(
      authToken,
      this.options.authTokenKey,
    );
  }

  async createAccessToken(refreshToken: string): Promise<string> {
    const decodedPayload = await TokenHelper.verifyToken(
      refreshToken,
      this.options.refreshTokenKey,
    );
    const user = await this.getActiveUserById(decodedPayload._id);
    if (!user) throw new NotFoundError('User not found!');

    const session = await SessionHelper.checkAndGetSession(
      decodedPayload.session,
    );

    await SessionHelper.updateRotation(session._id.toString());

    const payload: TokenPayload = {
      session: session._id.toString(),
      isAdmin: this.userType === allowedUserTypes.ADMIN,
      _id: user._id,
      role: (user as any)?.roleId,
    };

    return TokenHelper.createToken(
      payload,
      this.options.authTokenKey,
      this.options.expiry,
    );
  }

  private static async invalidateAccessToken(
    sessionId: string,
    exp: number,
  ) {
    return redisClient.setex(sessionId, Math.floor(exp), '1');
  }

  async createRefreshToken(userId: string): Promise<string> {
    const user = await this.getActiveUserById(userId);
    if (!user) throw new NotFoundError('No active users found!');

    const session = await SessionHelper.createSession(user._id);

    const payload: TokenPayload = {
      session: session._id.toString(),
      isAdmin: this.userType === allowedUserTypes.ADMIN,
      _id: user._id,
      role: (user as any).roleId,
    };

    return TokenHelper.createToken(
      payload,
      this.options.refreshTokenKey,
      this.options.refreshExpiry,
    );
  }

  static async logout(authToken: string) {
    const decoded: any = jwt.decode(authToken);
    if (!decoded) throw new UnauthorizedError('Invalid session.');
    const remaining = Number(decoded?.exp) * 1000 - Date.now();
    await TokenHelper.invalidateAccessToken(
      decoded.session,
      remaining / 1000,
    );
    await SessionHelper.removeSession(decoded.session);
  }

  static async validateAuthToken(authToken: string) {
    const decoded: any = jwt.decode(authToken);
    if (!decoded) throw new UnauthorizedError('Invalid session.');

    if (await redisClient.get(decoded.session)) {
      throw new UnauthorizedError('Invalid session.');
    }
  }
}
