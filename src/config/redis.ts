import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";
import { Logger } from "./logger";
import { isNullOrUndefined } from "./utils";

dotenv.config();

const logger = new Logger("Redis");

let redisClient: Redis | null = null;

const redisUrl = process.env.redisURI;
const redisToken = process.env.redisToken;

if (isNullOrUndefined(redisUrl) || isNullOrUndefined(redisToken)) {
  logger.error("Redis URL or Token not found");
  process.exit(1);
}

export const initRedis = () => {
  if (!redisClient) {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    logger.info("Redis Client Initialised Successfully");
  }
  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    logger.info("Client not initialised, initialising...");
    initRedis();
  }
  return redisClient;
};
