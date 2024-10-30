import { Router } from 'express';
import { UserController } from 'src/core/controllers';
import { handleRoute, validateRequest } from 'src/core/utils';
import {
  changePasswordValidator,
  loginValidator,
  requestResetPwdCodeValidator,
  resetPasswordValidator,
  signupValidator,
} from 'src/core/validators';
import { authMiddleware } from 'src/core/middlewares';

const userRouter = Router();

userRouter.post(
  '/login',
  validateRequest(loginValidator),
  handleRoute(UserController.login),
);
userRouter.post(
  '/signup',
  validateRequest(signupValidator),
  handleRoute(UserController.signup),
);
userRouter.get(
  '/resetPassword',
  validateRequest(requestResetPwdCodeValidator),
  handleRoute(UserController.resetPasswordCode),
);
userRouter.patch(
  '/resetPassword',
  validateRequest(resetPasswordValidator),
  handleRoute(UserController.verfiyCodeAndResetPassword),
);

userRouter.use(authMiddleware());
userRouter.get('/logout', handleRoute(UserController.logout));
userRouter.get('/', handleRoute(UserController.get));
userRouter.patch(
  '/password',
  validateRequest(changePasswordValidator),
  handleRoute(UserController.changePassword),
);

export default userRouter;
