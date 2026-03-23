import { Router } from "express";

import { logger } from "../lib/logger";
import { fullSync } from "../sync/fullSync";

const router = Router();

// POST /api → manual trigger
router.post("/", (req, res) => {
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
