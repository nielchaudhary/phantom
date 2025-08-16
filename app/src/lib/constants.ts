const devURL = "http://localhost:8090";
const prodURL = "https://phantom-18fu.onrender.com";

export const PHANTOM_API_URL =
  import.meta.env.MODE === "production" ? prodURL : devURL;
