import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios, { AxiosError } from "axios";
import { PHANTOM_API_URL } from "./constants";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return (error as AxiosError).isAxiosError !== undefined;
}

export async function fetchPhantomUser(targetPhantomId: string, token: string) {
  const resp = await axios.get(PHANTOM_API_URL + "/phantom/v1/fetch-user", {
    params: {
      targetPhantomId,
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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

export async function authenticateUser(mnemonic: string[]) {
  const resp = await axios.post(
    PHANTOM_API_URL + "/phantom/v1/auth",
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

export async function getInvite(receiver: string, chatId: string) {
  const resp: authenticateUserResponse = await axios.get(
    PHANTOM_API_URL + "/phantom/v1/get-invite",
    {
      params: {
        receiver,
        chatId,
      },
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return resp;
}

export async function getUserData(token: string) {
  const resp = await axios.get(PHANTOM_API_URL + "/phantom/v1/get-user-data", {
    params: {
      token,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
  return resp;
}

export function showSuccessToast(message: string, duration: number) {
  toast.success(message, {
    duration,
    style: {
      background: "black",
      color: "white",
      border: "none",
    },
    position: "top-center",
  });
}

export function showErrorToast(message: string, duration: number) {
  toast.error(message, {
    duration,
    position: "top-center",
    style: {
      border: "none",
    },
  });
}

export interface authenticateUserResponse {
  message: string;
  userData: {
    phantomId: string;
    jwtToken: string;
  };
}
