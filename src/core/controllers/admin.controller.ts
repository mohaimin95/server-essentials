import { cookieRefs } from 'src/core/utils/constants';
import { getCookieParamForTokens } from 'src/core/utils/functions';
import { IAuthRequest } from 'src/core/interfaces';
import { AdminService } from 'src/core/services';
import { Controller, CookieParam } from 'src/core/types';
import { redisClient } from 'src/core/utils';
import { Request, Response } from 'express';
import initData from 'src/core/data/initData';

export default class AdminController {
  static login: Controller = async (req: Request) => {
    const tokens = await AdminService.login(req.body);

    const cookies = getCookieParamForTokens(tokens) as CookieParam[];

    return {
      response: {
        message: 'Success.',
      },
      cookies,
    };
  };

  static signup: Controller = async (req: Request) => {
    const tokens = await AdminService.signUp(req.body);
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
      (await AdminService.get(req.user?._id || '')) || {};
    return {
      response,
    };
  };

  static changePassword: Controller = async (req: IAuthRequest) => {
    await AdminService.changePassword(req.user?._id, req.body);
    return {
      response: {
        message: 'Password successfully changed.',
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

  static init: Controller = async (_req: IAuthRequest) => {
    await initData();
    return {
      response: {
        message: 'Successfully inserted data 👍',
      },
    };
  };

  static clearCache: Controller = async () => {
    await redisClient.flushall();
    return {
      response: {
        message: 'Cache successfully cleared',
      },
    };
  };
}
