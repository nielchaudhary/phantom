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

export interface ChatCreator {
  isCreator: boolean;
  loggedInUser: string;
  targetUser: string;
  roomId: string;
}

export const ChatCreatorState = atom<ChatCreator>({
  key: "ChatCreatorState",
  default: {
    isCreator: false,
    loggedInUser: "",
    targetUser: "",
    roomId: "",
  },
});
