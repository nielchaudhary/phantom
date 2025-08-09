import express from "express";
import { generateIdentity } from "../api/generate-identity";
import { getIdentity } from "../api/get-identity";
import { verifyUserExists } from "../api/verify-user-exists";

const router = express.Router();

router.post("/generate-identity", generateIdentity);
router.post("/get-identity", getIdentity);
router.get("/verify-user-exists", verifyUserExists);

export const phantomRouter: [string, express.Router] = ["/v1", router];
