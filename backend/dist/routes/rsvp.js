"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("../lib/logger");
const rsvpQueue_1 = require("../queue/rsvpQueue");
const validation_1 = require("../lib/validation");
const validateGuest_1 = require("../lib/validateGuest");
const router = (0, express_1.Router)();
// POST /api/rsvp - accepts flat body from frontend: invite_token, guest_id, attending_wedding, attending_braai, dietary_requirements
router.post("/", async (req, res) => {
    const { invite_token, guest_id, attending_wedding, attending_braai, dietary_requirements } = req.body;
    if (!(0, validation_1.isValidToken)(invite_token)) {
        logger_1.logger.warn("RSVP rejected: invalid invite_token");
        return res.status(400).json({ message: "Valid invite_token is required" });
    }
    if (typeof guest_id !== "string" || !guest_id.trim() || guest_id.length > 50) {
        logger_1.logger.warn("RSVP rejected: invalid guest_id");
        return res.status(400).json({ message: "Valid guest_id is required" });
    }
    const isGuest = await (0, validateGuest_1.isGuestInInvite)(invite_token, guest_id.trim());
    if (!isGuest) {
        logger_1.logger.warn("RSVP rejected: guest not in invite", { invite_token, guest_id });
        return res.status(403).json({ message: "Guest not found for this invitation" });
    }
    const dietary = (0, validation_1.sanitizeString)(dietary_requirements, validation_1.LIMITS.dietary_requirements);
    logger_1.logger.info("RSVP received", { invite_token, guest_id, attending_wedding, attending_braai });
    try {
        const submission = {
            invite_token,
            responses: [{
                    invite_token,
                    guest_id: guest_id.trim(),
                    attending_wedding: attending_wedding === true || attending_wedding === false ? attending_wedding : undefined,
                    attending_braai: attending_braai === true || attending_braai === false ? attending_braai : undefined,
                    dietary_requirements: dietary ?? "",
                }],
        };
        await (0, rsvpQueue_1.appendRSVPToJSON)(submission);
        logger_1.logger.debug("RSVP saved", { invite_token, guest_id });
        res.json({ message: "RSVP saved successfully" });
    }
    catch (err) {
        logger_1.logger.error("Failed to save RSVP", err, { invite_token, guest_id });
        res.status(500).json({ message: "Failed to save RSVP" });
    }
});
exports.default = router;
