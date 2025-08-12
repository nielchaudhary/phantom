import express from "express";
import { generateIdentity } from "../api/generate-identity";
import { getIdentity } from "../api/get-identity";
import { verifyUserExists } from "../api/verify-user-exists";
import { getInvite } from "../api/get-invite";

const router = express.Router();

router.post("/generate-identity", generateIdentity);
router.post("/get-identity", getIdentity);
router.get("/verify-user-exists", verifyUserExists);
router.get("/get-invite", getInvite);

export const phantomRouter: [string, express.Router] = ["/phantom/v1", router];
