import { Logger } from "../config/logger";
import { getErrorText } from "../config/error";
import { Request, Response } from "express";
import { PhantomIdentity } from "../config/identity";
import { getDBColl, USERS_COLL } from "../config/db";
import { isNullOrUndefined } from "../config/utils";
import jwt from "jsonwebtoken";

const logger = new Logger("verify-user-exists");

export const getUserData = async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token: string };

    if (!token) {
      return res.status(400).send({
        message: "Invalid Token",
      });
    }

    const decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as {
      phantomId: string;
    };

    const usersColl = await getDBColl<Partial<PhantomIdentity>>(USERS_COLL);

    const user = await usersColl.findOne({
      phantomId: decodedUser.phantomId,
    });

    if (isNullOrUndefined(user)) {
      return res.status(404).send({
        message: "User Not Found, Please Check Phantom ID again.",
      });
    }

    return res.status(200).send({
      message: "User Found",
      userData: {
        phantomId: user.phantomId,
      },
    });
  } catch (error) {
    logger.error(
      "Could not verify user identity due to : ",
      getErrorText(error as Error),
      error
    );
    return res.status(500).send({
      message: "Failed to verify user identity, Please Check Phantom ID again.",
      error: getErrorText(error as Error),
    });
  }
};
