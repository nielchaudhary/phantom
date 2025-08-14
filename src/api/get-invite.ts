import { Request, Response } from "express";
import { Logger } from "../config/logger";
import { getErrorText } from "../config/error";
import { getDBColl, INVITES_COLL } from "../config/db";
import { Invite, isNullOrUndefined } from "../config/utils";

const logger = new Logger("get-invites");

export const getInvite = async (req: Request, res: Response) => {
  const { receiverPhantomId, roomId } = req.query as {
    receiverPhantomId: string;
    roomId: string;
  };
  try {
    if (!receiverPhantomId || !roomId) {
      return res.status(400).send({
        message: "Receiver PhantomID and RoomID are required",
        invite: null,
      });
    }

    const invitesColl = await getDBColl<Invite>(INVITES_COLL);

    const invite = await invitesColl.findOne({
      roomId,
      receiverPhantomId,
    });

    if (isNullOrUndefined(invite)) {
      return res.status(404).send({
        message: "Invite Not Found, Please Check PhantomID and ChatID again",
        invite: null,
      });
    }
    return res.status(200).send({
      message: "Invite fetched successfully",
      invite,
    });
  } catch (error) {
    logger.error(
      `Could not fetch invite for the user :${receiverPhantomId} due to ${error}`
    );
    return res.status(500).send({
      message: getErrorText(error as Error),
      invite: null,
    });
  }
};
