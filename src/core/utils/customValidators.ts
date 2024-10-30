import Joi from 'joi';

export const passwordValidator = () => Joi.string().min(8);
export const objectIdValidator = () => Joi.string().hex().length(24);
