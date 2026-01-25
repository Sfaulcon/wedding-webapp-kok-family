import { Router } from "express";
import { appendRSVPToJSON } from "../queue/rsvpQueue";

const router = Router();

// POST /api/rsvp/:token
router.post("/:token", async (req, res) => {
  const token = req.params.token;
  const rsvp = req.body; // should match RSVPSubmission

  try {
    await appendRSVPToJSON({ invite_token: token, responses: rsvp.responses });
    res.json({ message: "RSVP queued successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to queue RSVP" });
  }
});

export default router;
