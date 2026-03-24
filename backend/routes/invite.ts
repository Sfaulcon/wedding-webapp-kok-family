import { Router } from "express";
import fs from "fs-extra";
import { logger } from "../lib/logger";
import { dataFile } from "../lib/paths";
import { isValidToken } from "../lib/validation";
import { loadWebsiteInfo } from "../lib/websiteInfo";

const router = Router();

const INVITES_FILE = dataFile("invites.json");
const GUESTS_FILE = dataFile("guests.json");
const ACCOMMODATION_FILE = dataFile("accommodation.json");
const RSVPS_FILE = dataFile("rsvps.json");
const RSVPS_FROM_SHEET_FILE = dataFile("rsvps_from_sheet.json");
const SONG_REQUESTS_FILE = dataFile("song_requests.json");
const VENUE_PAYMENTS_FILE = dataFile("venue_payments.json");

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

function getRowValue(row: Record<string, unknown>, ...keys: string[]): string | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/\s/g, "_");
  for (const key of keys) {
    for (const k of Object.keys(row)) {
      if (norm(k) === norm(key)) {
        const v = row[k];
        if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
        return undefined;
      }
    }
  }
  return undefined;
}

function isPaymentReceived(val: unknown): boolean {
  if (val == null || val === "") return false;
  const s = String(val).toUpperCase();
  return s === "TRUE" || s === "YES" || s === "1";
}

async function getVenuePaymentsByToken(token: string): Promise<Map<string, { cottage_number?: string; amount_owed?: string; payment_received: boolean }>> {
  const map = new Map<string, { cottage_number?: string; amount_owed?: string; payment_received: boolean }>();
  try {
    if (!(await fs.pathExists(VENUE_PAYMENTS_FILE))) return map;
    const rows = (await fs.readJSON(VENUE_PAYMENTS_FILE)) as Array<Record<string, unknown>>;
    for (const row of rows) {
      const rowToken = getInviteToken(row) ?? row.invite_token;
      if (String(rowToken) !== token) continue;
      const guestId = getGuestId(row) ?? row.guest_id;
      if (!guestId) continue;
      const cottage = getRowValue(row, "cottage_number", "cottage");
      const amount = getRowValue(row, "amount_owed", "amount");
      const paymentVal = getRowValue(row, "payment_received", "payment_recieved");
      map.set(String(guestId), {
        cottage_number: cottage,
        amount_owed: amount,
        payment_received: isPaymentReceived(paymentVal ?? row.payment_received ?? row.payment_recieved),
      });
    }
  } catch (err) {
    logger.warn("Failed to read venue_payments.json", { token, error: String(err) });
  }
  return map;
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

async function getSongRequestsForToken(token: string): Promise<Array<{ song_title: string; artist?: string; guest_id?: string }>> {
  try {
    if (!(await fs.pathExists(SONG_REQUESTS_FILE))) return [];
    const data = (await fs.readJSON(SONG_REQUESTS_FILE)) as Array<Record<string, unknown>>;
    return data
      .filter((r) => (r.invite_token ?? getInviteToken(r)) === token)
      .map((r) => ({
        song_title: String(r.song_title ?? ""),
        artist: r.artist ? String(r.artist) : undefined,
        guest_id: r.guest_id ? String(r.guest_id) : undefined,
      }));
  } catch (err) {
    logger.warn("Failed to read song_requests.json", { token, error: String(err) });
    return [];
  }
}

// GET /api/invite/:token
router.get("/:token", async (req, res) => {
  const token = req.params.token;
  if (!isValidToken(token)) {
    return res.status(400).json({ message: "Invalid invite token" });
  }
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
    const venuePayments = await getVenuePaymentsByToken(token);

    logger.debug("RSVP status loaded", {
      token,
      guestCount: guestsForInvite.length,
      rsvpedCount: rsvpedIds.size,
      rsvpedGuestIds: Array.from(rsvpedIds),
    });

    const guestsWithRsvp = guestsForInvite.map((g: Record<string, unknown>) => {
      const val = g.accomodation_required ?? g.accommodation_required;
      const gid = String(g.guest_id ?? "");
      const venue = venuePayments.get(gid);
      return {
        ...g,
        accomodation_required: hasAccommodation(val) ? "TRUE" : "FALSE",
        has_rsvped: rsvpedIds.has(gid),
        cottage_number: venue?.cottage_number,
        amount_owed: venue?.amount_owed,
        payment_received: venue?.payment_received ?? false,
      };
    });

    const needsAccommodation = guestsWithRsvp.some(
      (g: Record<string, unknown>) => g.accomodation_required === "FALSE"
    );
    const song_requests = await getSongRequestsForToken(token);
    const websiteInfo = await loadWebsiteInfo();
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
      banking_details: websiteInfo.banking.formatted,
      song_requests,
      website_info: websiteInfo,
    });
  } catch (err) {
    logger.error("Invite lookup failed", err, { token });
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
