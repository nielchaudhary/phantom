export const PHANTOM_API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8090"
    : "https://phantom-18fu.onrender.com";
