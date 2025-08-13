import { ModalBody, ModalContent, ModalFooter } from "../ui/animated-modal";
import { StatefulButton } from "../ui/stateful-button";
import Mnemonic from "../ui/mnemonic";

export interface GenerateIdentityResponse {
  /**
   * A 12-word BIP39 mnemonic phrase, used for generating a key pair.
   * The mnemonic is used to generate a private key and a public key,
   * which are then used to create a Phantom identity.
   */
  mnemonic: string[];
  phantomId: string;
}

export default function GenerateIdentity({
  identity,
}: {
  identity: GenerateIdentityResponse;
}) {
  return (
    <ModalBody>
      <ModalContent>
        <div className="flex flex-col items-center justify-center p-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-red-500 font-bold mb-6 text-center">
              Mnemonic phrase will be used for login, store it in a safe place
            </label>
            <label className="flex justify-center items-center gap-2 text-sm text-gray-300 mb-4 text-center">
              Phantom ID will be used as your public ID to interact with users
            </label>
          </div>
          <div>
            <p className="flex items-center gap-2 px-4 py-2 text-sm text-white mb-8 border border-zinc-700 p-2 rounded-lg font-semibold">
              Phantom ID : {identity.phantomId}
            </p>
          </div>

          <div className="w-full max-w-md">
            {identity.mnemonic.length > 0 && (
              <Mnemonic mnemonic={identity.mnemonic} />
            )}
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <StatefulButton
          className="stateful-button"
          onClick={() => {
            navigator.clipboard.writeText(identity.mnemonic.join(" "));
          }}
        >
          Copy to Clipboard
        </StatefulButton>
      </ModalFooter>
    </ModalBody>
  );
}
