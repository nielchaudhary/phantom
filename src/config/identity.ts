import { ed25519 } from "@noble/curves/ed25519";
import { bytesToHex, hexToBytes } from "@noble/curves/abstract/utils";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { Logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

const logger = new Logger("identity");

export interface PhantomIdentity {
  privateKey: string;
  publicKey: string;
  phantomId: string;
}

export interface PhantomIdentityWithMnemonic extends PhantomIdentity {
  mnemonic: string;
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

  /**
   * Generate a phantom identity with mnemonic phrase for easy recovery
   * @returns {PhantomIdentityWithMnemonic} Object containing privateKey, publicKey, phantomId, and mnemonic
   */
  public static generateAnonymousIdentityWithMnemonic(): PhantomIdentityWithMnemonic {
    logger.info("Generating new anonymous phantom identity with mnemonic");

    const mnemonic = generateMnemonic();
    const identity = this.restoreFromMnemonic(mnemonic);

    logger.info(
      `Generated phantom identity with mnemonic: ${identity.phantomId}`
    );

    return {
      ...identity,
      mnemonic,
    };
  }

  /**
   * Restore identity from mnemonic phrase
   * @param {string} mnemonic - The 12-word mnemonic phrase
   * @returns {PhantomIdentity} Restored identity
   * @throws {Error} If mnemonic is invalid
   */
  public static restoreFromMnemonic(mnemonic: string): PhantomIdentity {
    logger.info("Restoring phantom identity from mnemonic");

    if (!validateMnemonic(mnemonic.trim())) {
      logger.error("Invalid mnemonic phrase provided");
      throw new Error("Invalid mnemonic phrase");
    }

    try {
      const seed = mnemonicToSeedSync(mnemonic.trim());
      const privateKey = seed.slice(0, 32);
      const publicKey = ed25519.getPublicKey(privateKey);

      // Generate deterministic phantom ID based on public key for consistency
      const phantomId = `phantom-${bytesToHex(publicKey).slice(0, 12)}`;

      logger.info(`Restored phantom identity: ${phantomId}`);

      return {
        privateKey: bytesToHex(privateKey),
        publicKey: bytesToHex(publicKey),
        phantomId,
      };
    } catch (error) {
      logger.error("Failed to restore identity from mnemonic", error);
      throw new Error("Failed to restore identity from mnemonic");
    }
  }

  /**
   * Restore identity from private key
   * @param {string} privateKeyHex - The private key in hex format
   * @returns {PhantomIdentity} Restored identity
   * @throws {Error} If private key is invalid
   */
  public static restoreFromPrivateKey(privateKeyHex: string): PhantomIdentity {
    logger.info("Restoring phantom identity from private key");

    try {
      const cleanPrivateKey = privateKeyHex.trim().replace(/^0x/, "");

      if (!/^[0-9a-fA-F]{64}$/.test(cleanPrivateKey)) {
        throw new Error("Invalid private key format");
      }

      const privateKeyBytes = hexToBytes(cleanPrivateKey);
      const publicKey = ed25519.getPublicKey(privateKeyBytes);

      // Generate deterministic phantom ID based on public key for consistency
      const phantomId = `phantom-${bytesToHex(publicKey).slice(0, 12)}`;

      logger.info(`Restored phantom identity: ${phantomId}`);

      return {
        privateKey: cleanPrivateKey,
        publicKey: bytesToHex(publicKey),
        phantomId,
      };
    } catch (error) {
      logger.error("Failed to restore identity from private key", error);
      throw new Error("Invalid private key");
    }
  }

  /**
   * Validate if a mnemonic phrase is valid
   * @param {string} mnemonic - The mnemonic phrase to validate
   * @returns {boolean} True if valid, false otherwise
   */
  public static validateMnemonic(mnemonic: string): boolean {
    return validateMnemonic(mnemonic.trim());
  }

  /**
   * Validate if a private key is valid
   * @param {string} privateKeyHex - The private key in hex format
   * @returns {boolean} True if valid, false otherwise
   */
  public static validatePrivateKey(privateKeyHex: string): boolean {
    try {
      const cleanPrivateKey = privateKeyHex.trim().replace(/^0x/, "");
      return /^[0-9a-fA-F]{64}$/.test(cleanPrivateKey);
    } catch {
      return false;
    }
  }
}
