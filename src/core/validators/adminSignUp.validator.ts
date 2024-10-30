import Joi, { CustomHelpers } from 'joi';
import {
  REGEXP_PATTERNS,
  isTempEmail,
} from 'src/core/utils/functions';
import { IAdminSignup } from 'src/core/interfaces';

const adminSignUpValidator = Joi.object<IAdminSignup>({
  name: Joi.string()
    .trim()
    .pattern(REGEXP_PATTERNS.ALPHABETS_AND_SPACE)
    .messages({
      'string.pattern.base':
        'Only alphabets and spaces are allowed for name.',
    })
    .required(),
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
  confirmPassword: Joi.string()
    .required()
    .equal(Joi.ref('password'))
    .label('Confirm password')
    .messages({ 'any.only': '{{#label}} does not match' }),
});

export default adminSignUpValidator;
