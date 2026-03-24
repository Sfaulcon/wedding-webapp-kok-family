"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullSync = fullSync;
const logger_1 = require("../lib/logger");
const paths_1 = require("../lib/paths");
const sheetQueue_1 = require("../queue/sheetQueue");
const sheetsSync_1 = require("./sheetsSync");
function fullSync() {
    logger_1.logger.info("Full sync triggered", { spreadsheetId: sheetsSync_1.SPREADSHEET_ID });
    const invitesJson = (0, paths_1.dataFile)("invites.json");
    const guestsJson = (0, paths_1.dataFile)("guests.json");
    const accommodationJson = (0, paths_1.dataFile)("accommodation.json");
    const rsvpsFromSheetJson = (0, paths_1.dataFile)("rsvps_from_sheet.json");
    const songRequestsJson = (0, paths_1.dataFile)("song_requests.json");
    const websiteInfoJson = (0, paths_1.dataFile)("website_info.json");
    const foodOptionsJson = (0, paths_1.dataFile)("food_options.json");
    const storyJson = (0, paths_1.dataFile)("story.json");
    const venuePaymentsJson = (0, paths_1.dataFile)("venue_payments.json");
    (0, sheetQueue_1.queueSyncSheet)(sheetsSync_1.SPREADSHEET_ID, "Invites", invitesJson);
    (0, sheetQueue_1.queueSyncSheet)(sheetsSync_1.SPREADSHEET_ID, "Guests", guestsJson);
    (0, sheetQueue_1.queueSyncSheet)(sheetsSync_1.SPREADSHEET_ID, "Accommodation_Options", accommodationJson);
    (0, sheetQueue_1.queueSyncSheet)(sheetsSync_1.SPREADSHEET_ID, "RSVPs", rsvpsFromSheetJson);
    (0, sheetQueue_1.queueSyncSheet)(sheetsSync_1.SPREADSHEET_ID, "Song_Requests", songRequestsJson);
    (0, sheetQueue_1.queueSyncSheet)(sheetsSync_1.SPREADSHEET_ID, "Website_Info", websiteInfoJson);
    (0, sheetQueue_1.queueSyncSheet)(sheetsSync_1.SPREADSHEET_ID, "Food_Options", foodOptionsJson);
    (0, sheetQueue_1.queueSyncSheet)(sheetsSync_1.SPREADSHEET_ID, "Story", storyJson);
    (0, sheetQueue_1.queueSyncSheet)(sheetsSync_1.SPREADSHEET_ID, "Venue_Payments", venuePaymentsJson);
    logger_1.logger.debug("All sync tasks queued", {
        sheets: ["Invites", "Guests", "Accommodation_Options", "RSVPs", "Song_Requests", "Website_Info", "Food_Options", "Story", "Venue_Payments"],
    });
}
