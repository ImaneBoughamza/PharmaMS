import Redis from "ioredis";
import logger from "../utils/logger.js";

let redis = null;

export function connectRedis() {
  const url = process.env.REDIS_URL;
  if (!url || url === "your_upstash_redis_url") {
    logger.warn("REDIS_URL not set — Redis disabled");
    return null;
  }

  redis = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });

  redis.on("connect", () => logger.info("✅ Redis connected"));
  redis.on("error", (err) => logger.warn(`Redis error: ${err.message}`));

  return redis;
}

export function getRedis() {
  return redis;
}
