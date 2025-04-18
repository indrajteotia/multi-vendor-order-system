const redis = require('redis');
const { promisify } = require('util');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379
});

const getAsync = promisify(redisClient.get).bind(redisClient);
const setexAsync = promisify(redisClient.setex).bind(redisClient);

exports.cache = (key, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      const cachedData = await getAsync(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      res.sendResponse = res.json;
      res.json = (body) => {
        setexAsync(key, ttl, JSON.stringify(body));
        res.sendResponse(body);
      };
      next();
    } catch (err) {
      console.error('Redis error:', err);
      next();
    }
  };
};