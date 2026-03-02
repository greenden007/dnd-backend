import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times) => {
    // Reconnect after
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Handle Redis connection events
redis.on('connect', () => {
  console.log('Redis client connected');
});

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

export const setCache = async (key: string, value: any, ttl?: number) => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  if (ttl) {
    return redis.set(key, stringValue, 'EX', ttl);
  }
  return redis.set(key, stringValue);
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    return value as unknown as T;
  }
};

export const deleteCache = (key: string) => redis.del(key);

export const clearCache = () => redis.flushdb();

export const cacheMiddleware = (key: string, ttl = 3600) => {
  return async (req: any, res: any, next: any) => {
    const cacheKey = `${key}:${req.originalUrl || req.url}`;
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      res.send(cachedData);
      return;
    }

    const originalSend = res.send;
    res.send = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCache(cacheKey, body, ttl).catch(console.error);
      }
      return originalSend.call(this, body);
    };

    next();
  };
};
