export const GENERATE_IDENTITY_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8090/v1/generate-identity"
    : "https://phantom-18fu.onrender.com/v1/generate-identity";

export const GET_IDENTITY_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8090/v1/get-identity"
    : "https://phantom-18fu.onrender.com/v1/get-identity";

export const VERIFY_USER_EXISTS_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8090/v1/verify-user-exists"
    : "https://phantom-18fu.onrender.com/v1/verify-user-exists";
