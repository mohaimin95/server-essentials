import {
  allowedUserTypes,
  userTypes,
} from 'src/core/utils/constants';
import { BcryptService } from 'src/core/services';
import {
  UnauthorizedError,
  ValidationError,
  ForbiddenEntryError,
} from 'src/core/errors';
import { ILogin } from 'src/core/interfaces';
import { TokenHelper } from '@@helpers';

export default class AuthService {
  static signInWithPwd = async (
    model: any,
    { email, password, phone }: ILogin,
    userRole: string = userTypes.USER,
  ): Promise<any> => {
    if (
      (typeof email !== 'string' && typeof phone !== 'string') ||
      typeof password !== 'string'
    ) {
      throw new ValidationError('Missing email or phone or password');
    }
    const condition: any = {};
    if (email) {
      condition.email = email?.toLowerCase().trim();
    } else if (phone) {
      condition.phone = phone?.toLowerCase().trim();
    } else {
      throw new ValidationError('Missing email or phone or password');
    }
    const results: any = await model
      .findOne(condition, {
        password: 1,
        emailConfirmedAt: 1,
        phoneConfirmedAt: 1,
        isActive: 1,
      })
      .select('+password');
    if (!results) {
      throw new UnauthorizedError('Invalid login');
    }
    const { password: pwdHash, isActive, _id: userId } = results;
    if (!isActive) {
      throw new ForbiddenEntryError(
        'User is blocked from accessing resources',
      );
    }
    const data = await BcryptService.compareHash(password, pwdHash);
    if (data !== true) {
      throw new UnauthorizedError('Invalid login');
    }
    const tokenHelper = new TokenHelper(
      (userRole === allowedUserTypes.ADMIN
        ? allowedUserTypes.ADMIN
        : allowedUserTypes.CUSTOMER) as any,
    );

    return tokenHelper.createTokens(userId);
  };
}
