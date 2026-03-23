import { Router } from "express";
import fs from "fs-extra";
import path from "path";

import { logger } from "../lib/logger";

const router = Router();

const INVITES_FILE = path.join(__dirname, "../data/invites.json");
const GUESTS_FILE = path.join(__dirname, "../data/guests.json");
const ACCOMMODATION_FILE = path.join(__dirname, "../data/accommodation.json");
const RSVPS_FILE = path.join(__dirname, "../data/rsvps.json");
const RSVPS_FROM_SHEET_FILE = path.join(__dirname, "../data/rsvps_from_sheet.json");

/**
 * TRUE/true/Yes/yes = has accommodation (don't show options)
 * FALSE/false/No/empty = needs accommodation (show options)
 */
function hasAccommodation(val: unknown): boolean {
  if (val == null || val === "") return false;
  const s = String(val).toUpperCase();
  return s === "TRUE" || s === "YES" || s === "1";
}

function getInviteToken(row: Record<string, unknown>): string | undefined {
  for (const k of Object.keys(row)) {
    if (k.toLowerCase().replace(/\s/g, "_") === "invite_token") {
      return String(row[k] ?? "");
    }
  }
  return undefined;
}

function getGuestId(row: Record<string, unknown>): string | undefined {
  for (const k of Object.keys(row)) {
    if (k.toLowerCase().replace(/\s/g, "_") === "guest_id") {
      return String(row[k] ?? "");
    }
  }
  return undefined;
}

async function getRsvpedGuestIds(token: string): Promise<Set<string>> {
  const ids = new Set<string>();
  try {
    if (await fs.pathExists(RSVPS_FILE)) {
      const rsvps = (await fs.readJSON(RSVPS_FILE)) as Array<Record<string, unknown>>;
      rsvps.forEach((r) => {
        const t = r.invite_token ?? getInviteToken(r);
        const g = r.guest_id ?? getGuestId(r);
        if (t === token && g) ids.add(String(g));
      });
      logger.debug("Loaded RSVPs from local file", { token, count: rsvps.length });
    } else {
      logger.debug("RSVPs file does not exist", { path: RSVPS_FILE });
    }
  } catch (err) {
    logger.warn("Failed to read rsvps.json", { token, error: String(err) });
  }
  try {
    if (await fs.pathExists(RSVPS_FROM_SHEET_FILE)) {
      const fromSheet = (await fs.readJSON(RSVPS_FROM_SHEET_FILE)) as Array<Record<string, unknown>>;
      fromSheet.forEach((r) => {
        const t = getInviteToken(r) ?? r.invite_token;
        const g = getGuestId(r) ?? r.guest_id;
        if (t === token && g) ids.add(String(g));
      });
      logger.debug("Loaded RSVPs from sheet sync file", { token, count: fromSheet.length });
    }
  } catch (err) {
    logger.warn("Failed to read rsvps_from_sheet.json", { token, error: String(err) });
  }
  return ids;
}

// GET /api/invite/:token
router.get("/:token", async (req, res) => {
  const token = req.params.token;
  logger.debug("Invite lookup started", { token });

  try {
    const invites = await fs.readJSON(INVITES_FILE);
    const guests = await fs.readJSON(GUESTS_FILE);
    const accommodation = await fs.readJSON(ACCOMMODATION_FILE);

    const invite = invites.find((i: Record<string, unknown>) => i.invite_token === token);
    if (!invite) {
      logger.warn("Invite not found", { token });
      return res.status(404).json({ message: "Invite not found" });
    }

    const guestsForInvite = guests.filter((g: Record<string, unknown>) => g.invite_token === token);
    const rsvpedIds = await getRsvpedGuestIds(token);

    logger.debug("RSVP status loaded", {
      token,
      guestCount: guestsForInvite.length,
      rsvpedCount: rsvpedIds.size,
      rsvpedGuestIds: Array.from(rsvpedIds),
    });

    const guestsWithRsvp = guestsForInvite.map((g: Record<string, unknown>) => {
      const val = g.accomodation_required ?? g.accommodation_required;
      return {
        ...g,
        accomodation_required: hasAccommodation(val) ? "TRUE" : "FALSE",
        has_rsvped: rsvpedIds.has(String(g.guest_id ?? "")),
      };
    });

    const needsAccommodation = guestsWithRsvp.some(
      (g: Record<string, unknown>) => g.accomodation_required === "FALSE"
    );
    logger.info("Invite served successfully", {
      token,
      groupName: invite.group_name,
      guestCount: guestsWithRsvp.length,
      needsAccommodation,
    });

    res.json({
      group_name: invite.group_name,
      guests: guestsWithRsvp,
      accommodation_options: accommodation,
    });
  } catch (err) {
    logger.error("Invite lookup failed", err, { token });
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
