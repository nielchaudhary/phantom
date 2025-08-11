import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios, { AxiosError } from "axios";
import { PHANTOM_API_URL } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ApiErrorResponse {
  error: string;
}

export const Status = {
  ONLINE: "online",
  OFFLINE: "offline",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return (error as AxiosError).isAxiosError !== undefined;
}

export function removeLocalStorageItems(...keys: string[]) {
  keys.forEach((key) => localStorage.removeItem(key));
}

export async function verifyExistsAndStatus(phantomId: string) {
  const resp = await axios.get(PHANTOM_API_URL + "/phantom/v1/get-status", {
    params: {
      phantomId: phantomId,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  return resp;
}

export async function verifyUserIdentity(mnemonic: string[]) {
  const resp = await axios.post(
    PHANTOM_API_URL + "/phantom/v1/get-identity",
    {
      mnemonic,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return resp;
}

export async function updateUserStatus(phantomId: string, status: string) {
  const resp = await axios.post(
    PHANTOM_API_URL + "/phantom/v1/update-status",
    {
      phantomId,
      status,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return resp;
}

export async function generateIdentity() {
  const resp = await axios.post(
    PHANTOM_API_URL + "/phantom/v1/generate-identity",
    {},
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return resp;
}

export async function getIdentity(mnemonic: string[]) {
  const resp = await axios.post(
    PHANTOM_API_URL + "/phantom/v1/get-identity",
    {
      mnemonic,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return resp;
}
