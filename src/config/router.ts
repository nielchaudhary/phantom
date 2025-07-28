import express from "express";
import { generateIdentity } from "../api/generate-identity";

const router = express.Router();

router.post("/generate-identity", generateIdentity);

export const phantomRouter: [string, express.Router] = ["/v1", router];
