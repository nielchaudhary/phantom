import { Request, Response } from "express";
import { Logger } from "../config/logger";
import { getErrorText } from "../config/error";
import { getDBColl, INVITES_COLL } from "../config/db";
import { Invite, isNullOrUndefined } from "../config/utils";

const logger = new Logger("get-invites");

export const getInvite = async (req: Request, res: Response) => {
  const { receiver, chatId } = req.query as {
    receiver: string;
    chatId: string;
  };
  try {
    if (!receiver || !chatId) {
      return res.status(400).send({
        error: "Receiver PhantomID and ChatID are required",
      });
    }

    const invitesColl = await getDBColl<Invite>(INVITES_COLL);

    const invite = await invitesColl.findOne({
      chatId,
      receiver,
    });

    if (isNullOrUndefined(invite)) {
      return res.status(404).send({
        error: "Invite Not Found, Please Check PhantomID and ChatID again",
      });
    }
    return res.status(200).send({
      invite,
    });
  } catch (error) {
    logger.error(
      `Could not fetch invite for the user :${receiver} due to ${error}`
    );
    return res.status(500).send({
      error: getErrorText(error as Error),
    });
  }
};
