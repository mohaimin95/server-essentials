import Joi from 'joi';
import { IResetPasswordRequest } from '@@interfaces';

const requestResetPwdCodeValidator =
  Joi.object<IResetPasswordRequest>({
    email: Joi.string().trim().lowercase().email(),
  });

export default requestResetPwdCodeValidator;
