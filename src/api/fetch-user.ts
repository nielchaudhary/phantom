import { getErrorText } from "../config/error";
import { Logger } from "../config/logger";
import { Request, Response } from "express";
import { getDBColl, USERS_COLL } from "../config/db";
import { isNullOrUndefined } from "../config/utils";
import jwt from "jsonwebtoken";
const logger = new Logger("fetch-user");

export const fetchPhantomUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { targetPhantomId } = req.query as { targetPhantomId: string };

    const token = req.headers.authorization?.split(" ")[1];

    if (isNullOrUndefined(process.env.JWT_SECRET)) {
      return res.status(500).send({
        success: false,
        message: "JWT Secret not found",
      });
    }

    if (isNullOrUndefined(token)) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    const decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as {
      phantomId: string;
      publicKey: string;
    };

    if (decodedUser.phantomId === targetPhantomId) {
      return res.status(400).send({
        success: false,
        message: "You cannot invite yourself",
      });
    }

    const user = await (
      await getDBColl(USERS_COLL)
    ).findOne({
      phantomId: targetPhantomId,
    });

    if (isNullOrUndefined(user)) {
      return res.status(404).send({
        success: false,
        message: "User Not Found, Please Check Phantom ID again",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Recipient User Verified Successfully",
    });
  } catch (error) {
    logger.error(
      "Could not get status due to : ",
      getErrorText(error as Error),
      error
    );
    return res.status(500).send({
      success: false,
      message: getErrorText(error as Error),
    });
  }
};
