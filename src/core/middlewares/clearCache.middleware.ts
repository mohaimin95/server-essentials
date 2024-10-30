import { IAuthRequest } from 'src/core/interfaces';
import { handleRoute, redisClient } from 'src/core/utils';

const clearCacheMiddleware = handleRoute(
  async (req: IAuthRequest) => {
    if (req.isAdmin) {
      await redisClient.flushall();
    }
    return {
      next: true,
    };
  },
);

export default clearCacheMiddleware;
