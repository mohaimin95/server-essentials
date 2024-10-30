import { cookieRefs } from 'src/core/utils/constants';
import { getCookieParamForTokens } from 'src/core/utils/functions';
import { IAuthRequest } from 'src/core/interfaces';
import { UserService } from 'src/core/services';
import { Controller, CookieParam } from 'src/core/types';
import { Request, Response } from 'express';

export default class UserController {
  static login: Controller = async (req: Request) => {
    const tokens = await UserService.login(req.body);
    const cookies = getCookieParamForTokens(tokens) as CookieParam[];

    return {
      response: {
        message: 'Success.',
      },
      cookies,
    };
  };

  static signup: Controller = async (req: Request) => {
    const tokens = await UserService.signUp(req.body);
    const cookies = getCookieParamForTokens(tokens) as CookieParam[];

    return {
      statusCode: 201,
      response: {
        message: 'Success.',
      },
      cookies,
    };
  };

  static get: Controller = async (req: IAuthRequest) => {
    const response =
      (await UserService.get(req.user?._id || '')) || {};
    return {
      response,
    };
  };

  static changePassword: Controller = async (req: IAuthRequest) => {
    await UserService.changePassword(req.user?._id, req.body);
    return {
      response: {
        message: 'Password successfully changed.',
      },
    };
  };

  static resetPasswordCode: Controller = async (req: Request) => {
    await UserService.requestResetPasswordCode(req.body.email);
    return {
      response: {
        message: 'OTP code is successfully requested.',
      },
    };
  };

  static verfiyCodeAndResetPassword: Controller = async (
    req: Request,
  ) => {
    await UserService.verfiyCodeAndResetPassword(
      req.body.email,
      req.body.code,
      req.body.newPassword,
    );
    return {
      response: {
        message: 'Password has been succssfully resetted.',
      },
    };
  };

  static logout: Controller = async (
    _req: IAuthRequest,
    res: Response,
  ) => {
    res.clearCookie(cookieRefs.AUTH_TOKEN);
    return {
      response: {
        message: 'Successfully logged out.',
      },
    };
  };
}
