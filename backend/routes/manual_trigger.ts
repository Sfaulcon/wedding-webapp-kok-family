import { Router } from "express";

import { logger } from "../lib/logger";
import { fullSync } from "../sync/fullSync";

const router = Router();

const SYNC_SECRET = process.env.SYNC_SECRET;
const INSECURE_DEFAULT = "change-me-in-production";

// POST /api → manual trigger (requires SYNC_SECRET in Authorization header or body)
router.post("/", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.body?.sync_secret;
  const secret = SYNC_SECRET || INSECURE_DEFAULT;

  if (process.env.NODE_ENV === "production" && (!SYNC_SECRET || SYNC_SECRET === INSECURE_DEFAULT)) {
    logger.warn("Manual sync disabled: set SYNC_SECRET in production");
    return res.status(503).json({ message: "Service unavailable" });
  }
  if (token !== secret) {
    logger.warn("Manual sync rejected: invalid or missing secret");
    return res.status(401).json({ message: "Unauthorized" });
  }

  logger.info("Manual sync triggered via API");
  try {
    fullSync();
    logger.debug("Sync tasks queued");
    res.json({ message: "Sheets sync triggered (queued)" });
  } catch (err) {
    logger.error("Manual sync failed", err);
    res.status(500).json({ message: "Sync failed", error: String(err) });
  }
});

export default router;
