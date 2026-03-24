import { Router } from "express";

import { logger } from "../lib/logger";
import { appendSongRequestToJSON } from "../queue/songRequestQueue";
import { isValidToken, sanitizeString, LIMITS } from "../lib/validation";
import { isGuestInInvite } from "../lib/validateGuest";

const router = Router();

// POST /api/song-request - accepts invite_token, guest_id, song_title, artist
router.post("/", async (req, res) => {
  const { invite_token, guest_id, song_title, artist } = req.body;

  if (!isValidToken(invite_token)) {
    logger.warn("Song request rejected: invalid invite_token");
    return res.status(400).json({ message: "Valid invite_token is required" });
  }
  if (typeof guest_id !== "string" || !guest_id.trim() || guest_id.length > 50) {
    logger.warn("Song request rejected: invalid guest_id");
    return res.status(400).json({ message: "Valid guest_id is required" });
  }
  const title = sanitizeString(song_title, LIMITS.song_title);
  if (!title) {
    return res.status(400).json({ message: "song_title is required" });
  }

  const isGuest = await isGuestInInvite(invite_token, guest_id.trim());
  if (!isGuest) {
    logger.warn("Song request rejected: guest not in invite", { invite_token, guest_id });
    return res.status(403).json({ message: "Guest not found for this invitation" });
  }

  const artistSanitized = sanitizeString(artist, LIMITS.artist);

  logger.info("Song request received", { invite_token, guest_id, song_title: title });

  try {
    await appendSongRequestToJSON({
      invite_token,
      guest_id: guest_id.trim(),
      song_title: title,
      artist: artistSanitized,
    });
    logger.debug("Song request queued", { invite_token, guest_id });
    res.json({ message: "Song request saved successfully" });
  } catch (err) {
    logger.error("Failed to queue song request", err, { invite_token, guest_id });
    res.status(500).json({ message: "Failed to save song request" });
  }
});

export default router;
