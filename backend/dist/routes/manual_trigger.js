"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("../lib/logger");
const fullSync_1 = require("../sync/fullSync");
const router = (0, express_1.Router)();
const INSECURE_DEFAULT = "change-me-in-production";
// POST /api → manual trigger (requires SYNC_SECRET in Authorization header or body)
router.post("/", (req, res) => {
    const SYNC_SECRET = process.env.SYNC_SECRET;
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : req.body?.sync_secret;
    const secret = SYNC_SECRET || INSECURE_DEFAULT;
    if (process.env.NODE_ENV === "production" && (!SYNC_SECRET || SYNC_SECRET === INSECURE_DEFAULT)) {
        logger_1.logger.warn("Manual sync disabled: set SYNC_SECRET in production");
        return res.status(503).json({ message: "Service unavailable" });
    }
    if (token !== secret) {
        logger_1.logger.warn("Manual sync rejected: invalid or missing secret");
        return res.status(401).json({ message: "Unauthorized" });
    }
    logger_1.logger.info("Manual sync triggered via API");
    try {
        (0, fullSync_1.fullSync)();
        logger_1.logger.debug("Sync tasks queued");
        res.json({ message: "Sheets sync triggered (queued)" });
    }
    catch (err) {
        logger_1.logger.error("Manual sync failed", err);
        res.status(500).json({ message: "Sync failed", error: String(err) });
    }
});
exports.default = router;