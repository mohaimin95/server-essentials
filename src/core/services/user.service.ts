import {
  IChangePasswordRequest,
  ILogin,
  ISignUp,
  IUser,
} from '@@interfaces';
import { User } from '@@models';
import {
  ForbiddenEntryError,
  NotFoundError,
  ValidationError,
} from '@@errors';
import { PasswordHelper, TokenHelper, UserHelper } from '@@helpers';
import { allowedUserTypes } from '@@constants';
import { AllowedUserTypes } from '@@types';
import AuthService from './auth.service';
import BcryptService from './bcrypt.service';

export default class UserService {
  static async signUp({ email, phone, name, password }: ISignUp) {
    await UserHelper.checkEmailOrPhoneExists(email, phone);
    const user = await UserHelper.createUser({
      name,
      email,
      phone,
      password: await BcryptService.createHash(password),
    });
    const tokenHelper = new TokenHelper();
    return tokenHelper.createTokens(user._id);
  }

  static async login(body: ILogin) {
    return AuthService.signInWithPwd(User, body);
  }

  static async get(id: string): Promise<IUser | null | undefined> {
    const user: IUser | null = await UserHelper.getUserById(id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    return user;
  }

  static async validate(userId: string): Promise<IUser> {
    const user: IUser = (await UserHelper.getUserById(
      userId,
    )) as IUser;
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    const { phoneConfirmedAt, emailConfirmedAt, isActive } = user;
    if (!isActive) {
      throw new ForbiddenEntryError(
        'Access denied. Please contact support.',
      );
    }
    if (!phoneConfirmedAt || !emailConfirmedAt) {
      const verificationParams = [];
      if (!phoneConfirmedAt) verificationParams.push('mobile number');
      if (!emailConfirmedAt) verificationParams.push('email address');
      throw new ForbiddenEntryError(
        'Please complete all verifications to continue.',
      );
    }
    return user;
  }

  static async changePassword(
    userId: string | undefined,
    data: IChangePasswordRequest,
  ) {
    if (!userId) {
      throw new NotFoundError('User not found.');
    }

    const user: IUser = (await UserHelper.getUserById(
      userId,
      '+password',
    )) as IUser;
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    if (
      await BcryptService.compareHash(
        data?.oldPassword as string,
        user.password,
      )
    ) {
      const hash: string = await BcryptService.createHash(
        data?.newPassword as string,
      );
      await UserHelper.updatePasswordByEmail(user.email, hash);
    } else {
      throw new ValidationError('Old password is incorrect.');
    }
  }

  static async requestResetPasswordCode(email: string) {
    return PasswordHelper.requestResetPasswordCode(email);
  }

  static async verfiyCodeAndResetPassword(
    email: string,
    code: string,
    newPassword: string,
  ) {
    return PasswordHelper.resetPassword(email, code, newPassword);
  }

  static async refreshAccessToken(
    refreshToken: string,
    isAdmin: boolean,
  ) {
    const tokenHelper = new TokenHelper(
      (isAdmin
        ? allowedUserTypes.ADMIN
        : allowedUserTypes.CUSTOMER) as AllowedUserTypes,
    );
    return tokenHelper.createAccessToken(refreshToken);
  }
}
