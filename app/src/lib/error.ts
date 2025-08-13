import { showErrorToast } from "./utils";
import { isAxiosError } from "axios";

interface ApiErrorResponse {
  message: string;
}

export const handleFrontendError = (
  error: Error | string,
  errorMessage: string
) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    errorMessage = error.response?.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  showErrorToast(errorMessage, 1500);
};
