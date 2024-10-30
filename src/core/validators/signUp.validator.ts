import Joi, { CustomHelpers } from 'joi';
import {
  REGEXP_PATTERNS,
  isTempEmail,
} from 'src/core/utils/functions';
import { ISignUp } from 'src/core/interfaces';

const signupValidator = Joi.object<ISignUp>({
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
  phone: Joi.string()
    .pattern(REGEXP_PATTERNS.MOBILE_NUMBER_INDIA)
    .messages({
      'string.pattern.base': 'Invalid mobile number.',
    })
    .min(10)
    .max(10)
    .required(),
  password: Joi.string().required().min(8),
  confirmPassword: Joi.string()
    .required()
    .equal(Joi.ref('password'))
    .label('Confirm password')
    .messages({ 'any.only': '{{#label}} does not match' }),
  //   captcha: Joi.string().required(),
  agreeAll: Joi.boolean().required().valid(true),
});

export default signupValidator;
