import { logger } from "starknet";
import { getDBColl, INVITES_COLL } from "./db";

export const isNullOrUndefined = (value: any): value is null | undefined => {
  return value === null || value === undefined;
};

export enum Status {
  ONLINE = "Online",
  OFFLINE = "Offline",
}

export interface Invite {
  chatId: string;
  sender: string;
  receiver: string;
  ctime: Date;
}

export const addInviteToDB = async (invite: Invite) => {
  try {
    const invitesColl = await getDBColl(INVITES_COLL);

    await invitesColl.insertOne({
      ...invite,
      ctime: new Date(),
    });

    logger.info(
      `Invite for user ${invite.receiver} Added to the DB successfully`
    );
  } catch (error) {
    logger.error(`Error Adding Invite to the DB due to ${error}`);
  }
};
