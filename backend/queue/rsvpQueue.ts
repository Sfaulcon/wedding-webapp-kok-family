import fs from "fs-extra";

import { logger } from "../lib/logger";
import { dataFile } from "../lib/paths";
import { enqueueRsvpSheetAppend } from "./sheetsWriteQueue";

interface GuestRSVP {
  timestamp: string;
  invite_token: string;
  guest_id: string;
  attending_wedding?: boolean;
  attending_braai?: boolean;
  dietary_requirements: string;
  needs_shuttle?: boolean;
  selected_accommodation?: string;
  synced?: boolean;
}

/** Input type: timestamp is added by appendRSVPToJSON */
export type GuestRSVPInput = Omit<GuestRSVP, "timestamp"> & { timestamp?: string };

export interface RSVPSubmission {
  invite_token: string;
  responses: GuestRSVPInput[];
}

const RSVPS_FILE = dataFile("rsvps.json");
const LOG_FILE = dataFile("rsvp_log.json");

/**
 * Persist RSVP to JSON immediately (no data loss), then enqueue Sheet append.
 * Returns after JSON is written; Sheet sync happens asynchronously via batched queue.
 */
export async function appendRSVPToJSON(rsvp: RSVPSubmission): Promise<void> {
  let data: GuestRSVP[] = [];
  if (await fs.pathExists(RSVPS_FILE)) {
    data = (await fs.readJSON(RSVPS_FILE)) as GuestRSVP[];
  }

  const timestamped: GuestRSVP[] = rsvp.responses.map((resp) => ({
    ...resp,
    timestamp: new Date().toISOString(),
    synced: false,
    dietary_requirements: resp.dietary_requirements ?? "",
  }));

  data.push(...timestamped);
  await fs.writeJSON(RSVPS_FILE, data, { spaces: 2 });

  logger.info("RSVP saved to JSON", {
    invite_token: rsvp.invite_token,
    guest_ids: rsvp.responses.map((r) => r.guest_id),
    totalRsvpsInFile: data.length,
  });

  // Enqueue for batched Sheet append (no await - fire and forget)
  const rows = timestamped.map((r) => ({
    timestamp: r.timestamp,
    invite_token: r.invite_token,
    guest_id: r.guest_id,
    attending_wedding: r.attending_wedding,
    attending_braai: r.attending_braai,
    dietary_requirements: r.dietary_requirements || "",
  }));
  enqueueRsvpSheetAppend(rows);

  // Log
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: "RSVP_SUBMITTED",
    invite_token: rsvp.invite_token,
    guest_ids: rsvp.responses.map((r) => r.guest_id),
  };
  let logData: unknown[] = [];
  if (await fs.pathExists(LOG_FILE)) {
    logData = (await fs.readJSON(LOG_FILE)) as unknown[];
  }
  logData.push(logEntry);
  await fs.writeJSON(LOG_FILE, logData, { spaces: 2 });
}
