import { userTypes } from 'src/core/utils/constants';
import { UnauthorizedError } from 'src/core/errors';
import { IDecryptedToken } from 'src/core/interfaces';
import { sign, SignCallback, verify } from 'jsonwebtoken';

export default class JWTService {
  static jwtKey: string = String(process.env.JWT_KEY);

  static getUserTypeFromKey(key: string): string {
    if (key === process.env.JWT_KEY) return userTypes.USER;
    if (key === process.env.JWT_ADMIN_KEY) return userTypes.ADMIN;
    return '';
  }

  static expireInMap: Record<string, number> = {
    [userTypes.USER]: Number(process.env.JWT_EXPIRES_IN) || 12,
    [userTypes.ADMIN]: 1,
  };

  static createToken(
    data: IDecryptedToken,
    cb: SignCallback,
    key: string = JWTService.jwtKey,
  ): void {
    sign(
      data,
      key,
      {
        algorithm: 'HS256',
        expiresIn: `${
          JWTService.expireInMap[JWTService.getUserTypeFromKey(key)]
        }d`,
      },
      cb,
    );
  }

  static verifyToken(
    token: string,
    key: string = JWTService.jwtKey,
  ): Promise<any> {
    return new Promise((resolve) => {
      verify(
        token,
        key,
        {
          algorithms: ['HS256'],
        },
        (err, data: any) => {
          if (err) {
            if (err.name === 'TokenExpiredError') {
              throw new UnauthorizedError('Session expired.', {
                redirect: true,
              });
            }

            throw new UnauthorizedError('Unauthorized');
          }
          resolve(data);
        },
      );
    });
  }

  static getToken(
    data: any,
    userRole: string = userTypes.USER,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const { _id, emailConfirmedAt, phoneConfirmedAt, isActive } =
        data;
      let key: string | undefined = JWTService.jwtKey;
      if (userRole === userTypes.ADMIN) {
        key = process.env.JWT_ADMIN_KEY;
      }
      const loggedInAt = new Date().toISOString();
      JWTService.createToken(
        {
          _id,
          emailConfirmedAt,
          phoneConfirmedAt,
          isActive,
          loggedInAt,
        },
        (err, token) => {
          if (err) return reject(err);
          resolve(String(token));
          // if (token)
          //   redisClient
          //     .setex(
          //       shortenToken(_id, token),
          //       10,
          //       (JWTService.expireInMap[userRole] + 1) * 24 * 60 * 60,
          //     )
          //     .then(() => resolve(String(token)))
          //     .catch((ex) => {
          //       logger.err(ex);
          //       reject(ex);
          //     });
        },
        key,
      );
    });
  }
}
