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
  const songRequestsJson = path.join(__dirname, "../data/song_requests.json");
  const websiteInfoJson = path.join(__dirname, "../data/website_info.json");
  const foodOptionsJson = path.join(__dirname, "../data/food_options.json");
  const storyJson = path.join(__dirname, "../data/story.json");
  const venuePaymentsJson = path.join(__dirname, "../data/venue_payments.json");

  queueSyncSheet(SPREADSHEET_ID, "Invites", invitesJson);
  queueSyncSheet(SPREADSHEET_ID, "Guests", guestsJson);
  queueSyncSheet(SPREADSHEET_ID, "Accommodation_Options", accommodationJson);
  queueSyncSheet(SPREADSHEET_ID, "RSVPs", rsvpsFromSheetJson);
  queueSyncSheet(SPREADSHEET_ID, "Song_Requests", songRequestsJson);
  queueSyncSheet(SPREADSHEET_ID, "Website_Info", websiteInfoJson);
  queueSyncSheet(SPREADSHEET_ID, "Food_Options", foodOptionsJson);
  queueSyncSheet(SPREADSHEET_ID, "Story", storyJson);
  queueSyncSheet(SPREADSHEET_ID, "Venue_Payments", venuePaymentsJson);

  logger.debug("All sync tasks queued", {
    sheets: ["Invites", "Guests", "Accommodation_Options", "RSVPs", "Song_Requests", "Website_Info", "Food_Options", "Story", "Venue_Payments"],
  });
}
