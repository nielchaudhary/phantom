import { atom } from "recoil";

export const LoginState = atom<{ phantomId: string }>({
  key: "LoginState",
  default: {
    phantomId: "",
  },
});
