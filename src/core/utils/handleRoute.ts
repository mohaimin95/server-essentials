/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import { Controller } from 'src/core/types';
import { NextFunction, Response } from 'express';
import { AppError } from 'src/core/errors';
import {
  IAuthRequest,
  IRouteHandlerOptions,
} from 'src/core/interfaces';
import { StatusCodes } from 'http-status-codes';
import logger from './logger';
import CacheRequest from './cacheRequest';

const handleRoute = (
  handlerFn: Controller,
  options: IRouteHandlerOptions = {},
) => {
  let cacheRequest: CacheRequest;
  return async (
    req: IAuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (
        options?.useCache &&
        req.query.skipCache !== 'true' &&
        !req?.isAdmin
      ) {
        cacheRequest = new CacheRequest(req);
        const cachedData = await cacheRequest.get();
        if (cachedData) {
          return res
            .status(StatusCodes.PARTIAL_CONTENT)
            .send(cachedData);
        }
      }
      const {
        statusCode = StatusCodes.OK,
        response,
        next: nxt,
        append,
        cookies,
      } = await handlerFn(req as IAuthRequest, res, next);
      if (append) {
        for (const key in append) {
          (req as any)[key] = append[key];
        }
      }
      if (cookies && cookies.length > 0) {
        for (const [key, value, cookiesOptions] of cookies) {
          res.cookie(key, value, cookiesOptions);
        }
      }
      if (nxt) {
        return next();
      }
      if (cacheRequest) {
        await cacheRequest.set(response);
      }
      res.status(statusCode).send(response);
    } catch (ex) {
      if (ex instanceof AppError) {
        const data = { message: ex.message, name: ex.name };
        if (ex.errResponse && typeof ex.errResponse === 'object') {
          for (const key in ex.errResponse) {
            (data as any)[key] = (ex.errResponse as any)[key];
          }
        }
        return res
          .status(ex.statusCode)
          .send({ message: ex.message, name: ex.name });
      }
      logger.imp('🔻 Unspecified Error Occurred Below 🔻');
      logger.err(ex, true);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: 'Unspecified Error',
      });
    }
  };
};

export default handleRoute;
