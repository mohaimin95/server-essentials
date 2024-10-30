import Joi, { CustomHelpers } from 'joi';
import { isTempEmail } from 'src/core/utils/functions';
import { ILogin } from 'src/core/interfaces';

const loginValidator = Joi.object<ILogin>({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .custom((value: string, helper: CustomHelpers<string>) => {
      if (isTempEmail(value)) return helper.error('email.invalid');
      return value;
    })
    .messages({
      'email.invalid': 'Temporary emails are not allowed',
    })
    .required(),
  password: Joi.string().required().min(8),
});

export default loginValidator;
