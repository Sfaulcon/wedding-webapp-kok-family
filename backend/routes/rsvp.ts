import { Router } from "express";

import { logger } from "../lib/logger";
import { appendRSVPToJSON, type RSVPSubmission } from "../queue/rsvpQueue";
import { isValidToken, sanitizeString, LIMITS } from "../lib/validation";
import { isGuestInInvite } from "../lib/validateGuest";

const router = Router();

// POST /api/rsvp - accepts flat body from frontend: invite_token, guest_id, attending_wedding, attending_braai, dietary_requirements
router.post("/", async (req, res) => {
  const { invite_token, guest_id, attending_wedding, attending_braai, dietary_requirements } = req.body;

  if (!isValidToken(invite_token)) {
    logger.warn("RSVP rejected: invalid invite_token");
    return res.status(400).json({ message: "Valid invite_token is required" });
  }
  if (typeof guest_id !== "string" || !guest_id.trim() || guest_id.length > 50) {
    logger.warn("RSVP rejected: invalid guest_id");
    return res.status(400).json({ message: "Valid guest_id is required" });
  }

  const isGuest = await isGuestInInvite(invite_token, guest_id.trim());
  if (!isGuest) {
    logger.warn("RSVP rejected: guest not in invite", { invite_token, guest_id });
    return res.status(403).json({ message: "Guest not found for this invitation" });
  }

  const dietary = sanitizeString(dietary_requirements, LIMITS.dietary_requirements);

  logger.info("RSVP received", { invite_token, guest_id, attending_wedding, attending_braai });

  try {
    const submission: RSVPSubmission = {
      invite_token,
      responses: [{
        invite_token,
        guest_id: guest_id.trim(),
        attending_wedding: attending_wedding === true || attending_wedding === false ? attending_wedding : undefined,
        attending_braai: attending_braai === true || attending_braai === false ? attending_braai : undefined,
        dietary_requirements: dietary ?? "",
      }],
    };
    await appendRSVPToJSON(submission);
    logger.debug("RSVP saved", { invite_token, guest_id });
    res.json({ message: "RSVP saved successfully" });
  } catch (err) {
    logger.error("Failed to save RSVP", err, { invite_token, guest_id });
    res.status(500).json({ message: "Failed to save RSVP" });
  }
});

export default router;
