import { Request, Response } from 'express';
import { ObjectSchema } from 'joi';
import { ValidationError } from 'src/core/errors';
import { Controller } from 'src/core/types';
import handleRoute from './handleRoute';

const validateRequest = <T>(validatorFn: ObjectSchema<T>) =>
  handleRoute(((req: Request, _res: Response) => {
    const validation = validatorFn.validate(req.body);
    if (validation.error) {
      throw new ValidationError(validation.error.message);
    }
    req.body = validation.value as T;
    return {
      next: true,
    };
  }) as Controller);

export default validateRequest;
