import path from "path";

import { logger } from "../lib/logger";
import { queueSyncSheet } from "../queue/sheetQueue";
import { SPREADSHEET_ID } from "./sheetsSync";

export function fullSync() {
  logger.info("Full sync triggered", { spreadsheetId: SPREADSHEET_ID });

  const invitesJson = path.join(__dirname, "../data/invites.json");
  const guestsJson = path.join(__dirname, "../data/guests.json");
  const accommodationJson = path.join(__dirname, "../data/accommodation.json");
  const rsvpsFromSheetJson = path.join(__dirname, "../data/rsvps_from_sheet.json");

  queueSyncSheet(SPREADSHEET_ID, "Invites", invitesJson);
  queueSyncSheet(SPREADSHEET_ID, "Guests", guestsJson);
  queueSyncSheet(SPREADSHEET_ID, "Accommodation_Options", accommodationJson);
  queueSyncSheet(SPREADSHEET_ID, "RSVPs", rsvpsFromSheetJson);

  logger.debug("All sync tasks queued", { sheets: ["Invites", "Guests", "Accommodation_Options", "RSVPs"] });
}
