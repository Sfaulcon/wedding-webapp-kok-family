import { Router } from "express";

import { logger } from "../lib/logger";
import { appendRSVPToJSON } from "../queue/rsvpQueue";

const router = Router();

// POST /api/rsvp - accepts flat body from frontend: invite_token, guest_id, attending_wedding, attending_braai, dietary_requirements
router.post("/", async (req, res) => {
  const { invite_token, guest_id, attending_wedding, attending_braai, dietary_requirements } = req.body;

  if (!invite_token || !guest_id) {
    logger.warn("RSVP rejected: missing required fields", { invite_token: !!invite_token, guest_id: !!guest_id });
    return res.status(400).json({ message: "invite_token and guest_id are required" });
  }

  logger.info("RSVP received", { invite_token, guest_id, attending_wedding, attending_braai });

  try {
    await appendRSVPToJSON({
      invite_token,
      responses: [{
        invite_token,
        guest_id,
        attending_wedding: attending_wedding ?? undefined,
        attending_braai: attending_braai ?? undefined,
        dietary_requirements: dietary_requirements || "",
      }],
    });
    logger.debug("RSVP queued", { invite_token, guest_id });
    res.json({ message: "RSVP queued successfully" });
  } catch (err) {
    logger.error("Failed to queue RSVP", err, { invite_token, guest_id });
    res.status(500).json({ message: "Failed to queue RSVP" });
  }
});

export default router;
