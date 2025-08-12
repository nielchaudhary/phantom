import { atom } from "recoil";

export interface ChatIdentity {
  senderPhantomId: string;
  targetPhantomId: string;
}

export const ChatIdentityState = atom<ChatIdentity>({
  key: "ChatIdentityState",
  default: {
    senderPhantomId: "",
    targetPhantomId: "",
  },
});
