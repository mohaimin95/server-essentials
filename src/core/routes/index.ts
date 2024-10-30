import { Router } from 'express';
import { sniffAuthToken } from 'src/core/middlewares';
import userRoutes from './user';
import adminRoutes from './admin';

const router = Router();

router.use(sniffAuthToken);

router.use('/user', userRoutes);
router.use('/admin', adminRoutes);

export default router;
