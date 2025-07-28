import { Logger } from "../config/logger";
import { getErrorText } from "../config/error";
import { Request, Response } from "express";
import { PhantomIdentity, PhantomIdentityGenerator } from "../config/identity";
import { getDBColl, USERS_COLL } from "../config/db";
import { isNullOrUndefined } from "../config/utils";

const logger = new Logger("get-identity");

export const getIdentity = async (req: Request, res: Response) => {
  try {
    const { mnemonic } = req.body as { mnemonic: string[] };

    const validateMnemonic = PhantomIdentityGenerator.validateMnemonic(
      mnemonic.join(" ")
    );

    if (!validateMnemonic) {
      return res.status(400).send({
        message: "Invalid Mnemonic Phrase",
      });
    }

    const usersColl = await getDBColl<Partial<PhantomIdentity>>(USERS_COLL);
    const deriveIdentity = PhantomIdentityGenerator.restoreFromMnemonic(
      mnemonic.join(" ")
    );

    const user = await usersColl.findOne({
      publicKey: deriveIdentity.publicKey,
    });

    if (isNullOrUndefined(user)) {
      return res.status(404).send({
        message: "User Not Found, Please Check Mnemonic Phrase again.",
      });
    }

    return res.status(200).send({
      message: "Identity restored successfully",
      identity: {
        ...deriveIdentity,
        phantomId: user?.phantomId,
      },
    });
  } catch (error) {
    logger.error(
      "Could not fetch user identity due to : ",
      getErrorText(error as Error),
      error
    );
    return res.status(500).send({
      message:
        "Failed to restore user identity, Please Check Mnemonic Phrase again.",
      error: getErrorText(error as Error),
    });
  }
};
