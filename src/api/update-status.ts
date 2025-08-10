import { Logger } from "../config/logger";
import { Request, Response } from "express";
import { getErrorText } from "../config/error";
import { isNullOrUndefined, Status } from "../config/utils";
import { getRedisClient } from "../config/redis";
import { getDBColl, USERS_COLL } from "../config/db";

const logger = new Logger("update-status");

export const updateStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { phantomId, status } = req.body as {
      phantomId: string;
      status: Status;
    };

    if (isNullOrUndefined(phantomId) || isNullOrUndefined(status)) {
      return res.status(400).send({
        success: false,
        error: "Phantom ID and Status are required",
      });
    }

    const user = await (
      await getDBColl(USERS_COLL)
    ).findOne({
      phantomId,
    });

    if (isNullOrUndefined(user)) {
      return res.status(404).send({
        success: false,
        error: "User Not Found, Please Check Phantom ID again.",
      });
    }

    const redisClient = getRedisClient();
    if (!redisClient) {
      return res.status(500).send({
        success: false,
        error: "Redis Client not initialised",
      });
    }

    await redisClient.set(phantomId, status);

    return res.status(200).send({
      status,
      success: true,
    });
  } catch (error) {
    logger.error(
      "Could not update status due to : ",
      getErrorText(error as Error),
      error
    );

    return res.status(500).send({
      success: false,
      error: getErrorText(error as Error),
    });
  }
};
