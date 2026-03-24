import fs from "fs-extra";

import { dataFile } from "./paths";

const GUESTS_FILE = dataFile("guests.json");

/**
 * Verify that the guest_id belongs to the invite_token. Prevents submitting
 * RSVPs or song requests for other guests' invites.
 */
export async function isGuestInInvite(
  inviteToken: string,
  guestId: string
): Promise<boolean> {
  try {
    if (!(await fs.pathExists(GUESTS_FILE))) return false;
    const guests = (await fs.readJSON(GUESTS_FILE)) as Array<Record<string, unknown>>;
    return guests.some(
      (g) =>
        String(g.invite_token ?? "") === inviteToken &&
        String(g.guest_id ?? "") === guestId
    );
  } catch {
    return false;
  }
}
