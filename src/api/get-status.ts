import { getRedisClient } from "../config/redis";
import { getErrorText } from "../config/error";
import { Logger } from "../config/logger";
import { Request, Response } from "express";
import { getDBColl, USERS_COLL } from "../config/db";
import { isNullOrUndefined } from "../config/utils";

const logger = new Logger("get-status");

export const getStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { phantomId } = req.query as { phantomId: string };
    if (!phantomId) {
      return res.status(400).send({
        error: "Invalid Phantom ID",
      });
    }

    const user = await (
      await getDBColl(USERS_COLL)
    ).findOne({
      phantomId,
    });

    if (isNullOrUndefined(user)) {
      return res.status(404).send({
        error: "User Not Found, Please Check Phantom ID again.",
      });
    }
    const redisClient = getRedisClient();
    if (!redisClient) {
      return res.status(500).send({
        error: "Redis Client not initialised",
      });
    }
    const status = await redisClient.get(phantomId);
    return res.status(200).send({
      status,
    });
  } catch (error) {
    logger.error(
      "Could not get status due to : ",
      getErrorText(error as Error),
      error
    );
    return res.status(500).send({
      error: getErrorText(error as Error),
    });
  }
};
