import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { VERIFY_USER_EXISTS_URL } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function verifyPhantomIdExists(phantomId: string) {
  const resp = axios.get(VERIFY_USER_EXISTS_URL, {
    params: {
      phantomId: phantomId,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  return resp;
}
