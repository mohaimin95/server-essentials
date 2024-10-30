import Joi from 'joi';
import { IResetPassword } from '@@interfaces';

const resetPasswordValidator = Joi.object<IResetPassword>({
  email: Joi.string().trim().lowercase().email().required(),
  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]{1,6}$/)
    .required(),
  newPassword: Joi.string().min(6).required(),
});

export default resetPasswordValidator;
