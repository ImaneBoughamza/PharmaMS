import Redis from "ioredis";
import logger from "../utils/logger.js";

let redis = null;

function createRedisClient() {
  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  client.on("connect", () => {
    logger.info("Redis connected");
  });

  client.on("error", (err) => {
    logger.error(`Redis error: ${err.message}`);
  });

  return client;
}

export async function connectRedis() {
  if (!process.env.REDIS_URL || process.env.REDIS_URL === "your_upstash_redis_url") {
    logger.warn("REDIS_URL not set - Redis disabled");
    return null;
  }

  try {
    if (!redis) redis = createRedisClient();
    await redis.connect();
    return redis;
  } catch (error) {
    logger.error(`Redis connection failed: ${error.message}`);
    return null;
  }
}

export function getRedis() {
  return redis;
}

export default redis;
