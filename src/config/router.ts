import express from "express";
import { generateIdentity } from "../api/generate-identity";
import { authenticateUser } from "../api/auth";
import { getUserData } from "../api/get-user-data";
import { fetchPhantomUser } from "../api/fetch-user";
import { getInvite } from "../api/get-invite";

const router = express.Router();

router.post("/generate-identity", generateIdentity);
router.post("/auth", authenticateUser);
router.get("/get-user-data", getUserData);
router.get("/get-invite", getInvite);
router.get("/fetch-user", fetchPhantomUser);

export const phantomRouter: [string, express.Router] = ["/phantom/v1", router];
