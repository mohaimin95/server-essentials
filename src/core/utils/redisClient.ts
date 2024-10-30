import Redis from 'ioredis';

const pwd = !!process.env.REDIS_PASSWORD?.trim();
const redisClient = pwd
  ? new Redis({
      host: process.env.REDIS_HOST?.toString() || 'localhost',
      port: Number(process.env.REDIS_PORT),
      username: 'default',
      password: process.env.REDIS_PASSWORD?.toString() || '',
    })
  : new Redis(
      Number(process.env.REDIS_PORT),
      process.env.REDIS_HOST?.toString() || 'localhost',
    );

export default redisClient;
