import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { PHANTOM_API_URL } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function verifyPhantomIdExists(phantomId: string) {
  const resp = axios.get(PHANTOM_API_URL + "/phantom/v1/verify-user-exists", {
    params: {
      phantomId: phantomId,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  return resp;
}
