import { PhantomIdentityGenerator } from "../config/identity";
import { Request, Response } from "express";
import { getErrorText } from "../config/error";
import { Logger } from "../config/logger";

const logger = new Logger("generate-identity");

export const generateIdentity = (_req: Request, res: Response) => {
  try {
    const identity = PhantomIdentityGenerator.generateAnonymousIdentity();
    logger.info(`generated identity for the user : ${identity.phantomId}`);
    return res.status(200).send({
      message: "Identity generated successfully",
      identity,
    });
  } catch (error) {
    logger.error(
      "Failed to generate identity due to : ",
      getErrorText(error as Error)
    );
    return res.status(500).send({
      message: "Failed to generate identity",
      error: getErrorText(error as Error),
    });
  }
};
