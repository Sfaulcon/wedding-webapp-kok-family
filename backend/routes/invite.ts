import { Router } from "express";
import fs from "fs-extra";
import path from "path";

const router = Router();

const INVITES_FILE = path.join(__dirname, "../data/invites.json");
const GUESTS_FILE = path.join(__dirname, "../data/guests.json");
const ACCOMMODATION_FILE = path.join(__dirname, "../data/accommodation.json");

// GET /api/invite/:token
router.get("/:token", async (req, res) => {
  const token = req.params.token;

  const invites = await fs.readJSON(INVITES_FILE);
  const guests = await fs.readJSON(GUESTS_FILE);
  const accommodation = await fs.readJSON(ACCOMMODATION_FILE);

  const invite = invites.find((i: any) => i.invite_token === token);
  if (!invite) return res.status(404).json({ message: "Invite not found" });

  const guestsForInvite = guests.filter((g: any) => g.invite_token === token);

  res.json({
    group_name: invite.group_name,
    guests: guestsForInvite,
    accommodation_options: accommodation
  });
});

export default router;
