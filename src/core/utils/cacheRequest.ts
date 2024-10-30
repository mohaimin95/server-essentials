import { getCacheKeyFromRequest } from 'src/core/utils/functions';
import { Request } from 'express';
import redisClient from './redisClient';

class CacheRequest {
  keyName: string;

  constructor(req: Request) {
    this.keyName = getCacheKeyFromRequest(req);
  }

  get = async () => {
    try {
      const dataStr = await redisClient.get(this.keyName);
      return dataStr ? JSON.parse(dataStr) : undefined;
    } catch (ex) {
      return undefined;
    }
  };

  set = async (data: any) =>
    redisClient.setex(this.keyName, 900, JSON.stringify(data));
}
export default CacheRequest;
