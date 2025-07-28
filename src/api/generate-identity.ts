import { PhantomIdentity, PhantomIdentityGenerator } from "../config/identity";
import { Request, Response } from "express";
import { getErrorText } from "../config/error";
import { Logger } from "../config/logger";
import { getDBColl, USERS_COLL } from "../config/db";

const logger = new Logger("generate-identity");

export const generateIdentity = async (_req: Request, res: Response) => {
  try {
    const usersColl = await getDBColl<Partial<PhantomIdentity>>(USERS_COLL);
    const maxRetries = 10;
    let attempts = 0;

    while (attempts < maxRetries) {
      const identity = PhantomIdentityGenerator.generateAnonymousIdentity();
      logger.info(`Generated identity for the user: ${identity.phantomId}`);

      const user = await usersColl.findOne({
        publicKey: identity.publicKey,
      });

      if (!user) {
        await usersColl.insertOne({
          publicKey: identity.publicKey,
          phantomId: identity.phantomId,
        });

        return res.status(200).send({
          message: "Identity generated successfully",
          identity,
        });
      }

      logger.info("Identity already exists, generating a new one");
      attempts++;
    }

    throw new Error("Unable to generate unique identity after maximum retries");
  } catch (error) {
    logger.error(
      "Failed to generate identity due to: ",
      getErrorText(error as Error)
    );
    return res.status(500).send({
      message: "Failed to generate identity",
      error: getErrorText(error as Error),
    });
  }
};
