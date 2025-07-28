import {
  PhantomIdentityWithMnemonic,
  PhantomIdentityGenerator,
} from "../config/identity";
import { Request, Response } from "express";
import { getErrorText } from "../config/error";
import { Logger } from "../config/logger";
import { getDBColl, USERS_COLL } from "../config/db";

const logger = new Logger("generate-identity");

interface GenerateIdentityResponse {
  mnemonic: string[];
}

export const generateIdentity = async (
  _req: Request,
  res: Response
): Promise<Response<GenerateIdentityResponse | undefined>> => {
  try {
    const usersColl = await getDBColl<Partial<PhantomIdentityWithMnemonic>>(
      USERS_COLL
    );
    const maxRetries = 10;
    let attempts = 0;

    while (attempts < maxRetries) {
      const identity =
        PhantomIdentityGenerator.generateAnonymousIdentityWithMnemonic();
      logger.info(`Generated identity for the user: ${identity.phantomId}`);

      const user = await usersColl.findOne({
        publicKey: identity.publicKey,
      });

      if (!user) {
        await usersColl.insertOne({
          publicKey: identity.publicKey,
        });

        return res.status(200).send({
          mnemonic: identity.mnemonic.split(" "),
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
      mnemonic: [],
    });
  }
};
