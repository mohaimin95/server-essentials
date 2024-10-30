import { passwordValidator } from 'src/core/utils/customValidators';
import { IChangePasswordRequest } from 'src/core/interfaces';
import Joi from 'joi';

const changePasswordValidator = Joi.object<IChangePasswordRequest>({
  oldPassword: Joi.string(),
  newPassword: passwordValidator()
    .required()
    .invalid(Joi.ref('oldPassword'))
    .messages({
      'any.invalid': 'Old and new passwords cannot be same.',
    }),
});

export default changePasswordValidator;
