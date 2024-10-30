import { Router } from 'express';
import { AdminController } from 'src/core/controllers';
import { handleRoute, validateRequest } from 'src/core/utils';
import {
  adminSignUpValidator,
  changePasswordValidator,
  loginValidator,
} from 'src/core/validators';
import { authMiddleware } from 'src/core/middlewares';
import { userTypes } from 'src/core/utils/constants';

const adminRoutes = Router();

adminRoutes.post(
  '/login',
  validateRequest(loginValidator),
  handleRoute(AdminController.login),
);
adminRoutes.post(
  '/signup',
  validateRequest(adminSignUpValidator),
  handleRoute(AdminController.signup),
);
adminRoutes.use(authMiddleware(userTypes.ADMIN));
adminRoutes.get('/initApp', handleRoute(AdminController.init));
adminRoutes.delete('/cache', handleRoute(AdminController.clearCache));
adminRoutes.get('/logout', handleRoute(AdminController.logout));
adminRoutes.get('/', handleRoute(AdminController.get));
adminRoutes.patch(
  '/password',
  validateRequest(changePasswordValidator),
  handleRoute(AdminController.changePassword),
);

export default adminRoutes;
