import { IPatchIsActiveRequest } from 'src/core/interfaces';
import Joi from 'joi';

const patchIsActiveValidator = Joi.object<IPatchIsActiveRequest>({
  isActive: Joi.boolean().required(),
});

export default patchIsActiveValidator;
