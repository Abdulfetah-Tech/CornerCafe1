import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

export const requireOwner: RequestHandler = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Authentication is required." });
    return;
  }
  next();
};