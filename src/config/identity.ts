import { ed25519 } from "@noble/curves/ed25519";
import { bytesToHex } from "@noble/curves/abstract/utils";
import { Logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

const logger = new Logger("identity");

export interface PhantomIdentity {
  privateKey: string;
  publicKey: string;
  phantomId: string;
}

export class PhantomIdentityGenerator {
  /**
   * Generate a completely anonymous phantom ID
   * @returns {PhantomIdentity} Object containing privateKey, publicKey, phantomId
   */
  public static generateAnonymousIdentity(): PhantomIdentity {
    logger.info("Generating new anonymous phantom identity");

    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(privateKey);

    const phantomId = `phantom-${uuidv4()}`;

    logger.info(`Generated phantom identity: ${phantomId}`);

    return {
      privateKey: bytesToHex(privateKey),
      publicKey: bytesToHex(publicKey),
      phantomId,
    };
  }
}
