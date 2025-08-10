import express from "express";
import { generateIdentity } from "../api/generate-identity";
import { getIdentity } from "../api/get-identity";
import { verifyUserExists } from "../api/verify-user-exists";
import { updateStatus } from "../api/update-status";
import { getStatus } from "../api/get-status";

const router = express.Router();

router.post("/generate-identity", generateIdentity);
router.post("/get-identity", getIdentity);
router.get("/verify-user-exists", verifyUserExists);
router.post("/update-status", updateStatus);
router.get("/get-status", getStatus);

export const phantomRouter: [string, express.Router] = ["/phantom/v1", router];
