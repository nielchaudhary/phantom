import express from "express";
import { generateIdentity } from "../api/generate-identity";
import { getIdentity } from "../api/get-identity";

const router = express.Router();

router.post("/generate-identity", generateIdentity);
router.post("/get-identity", getIdentity);

export const phantomRouter: [string, express.Router] = ["/v1", router];
