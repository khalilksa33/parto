import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

declare global {
  var redis: any;
}

if (redisUrl) {
  global.redis = global.redis || new Redis(redisUrl, { lazyConnect: true });
} else {
  // Mock Redis to prevent crashes when not deployed
  global.redis = global.redis || {
    get: async () => null,
    setex: async () => {},
    del: async () => {},
  };
}

export const redis = global.redis;
