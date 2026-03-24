import { logger } from "../lib/logger";
import { dataFile } from "../lib/paths";
import { queueSyncSheet } from "../queue/sheetQueue";
import { SPREADSHEET_ID } from "./sheetsSync";

export function fullSync() {
  logger.info("Full sync triggered", { spreadsheetId: SPREADSHEET_ID });

  const invitesJson = dataFile("invites.json");
  const guestsJson = dataFile("guests.json");
  const accommodationJson = dataFile("accommodation.json");
  const rsvpsFromSheetJson = dataFile("rsvps_from_sheet.json");
  const songRequestsJson = dataFile("song_requests.json");
  const websiteInfoJson = dataFile("website_info.json");
  const foodOptionsJson = dataFile("food_options.json");
  const storyJson = dataFile("story.json");
  const venuePaymentsJson = dataFile("venue_payments.json");

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
