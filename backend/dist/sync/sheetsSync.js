"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPREADSHEET_ID = void 0;
exports.syncSheetToJSON = syncSheetToJSON;
exports.appendRsvpToSheet = appendRsvpToSheet;
exports.appendSongRequestToSheet = appendSongRequestToSheet;
const googleapis_1 = require("googleapis");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../lib/logger");
const paths_1 = require("../lib/paths");
const CREDENTIALS_PATH = (0, paths_1.credentialsFile)("google-key.json");
const LOG_FILE = (0, paths_1.dataFile)("sync_log.json");
exports.SPREADSHEET_ID = process.env.SPREADSHEET_ID || "1jyuMv2Ek_wwQUmM-0LMZs79J2bCWIdTv6sZOUZvSAe0";
const RSVPS_SHEET = "RSVPs";
async function authSheets() {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return googleapis_1.google.sheets({ version: "v4", auth });
}
/**
 * Fetch Google Sheet, detect changes, write JSON and log if changed
 */
async function syncSheetToJSON(spreadsheetId, sheetName, jsonFilePath) {
    const fileName = path_1.default.basename(jsonFilePath);
    logger_1.logger.info("Sheet sync started", { sheet: sheetName, targetFile: fileName });
    try {
        const sheets = await authSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: sheetName,
        });
        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            logger_1.logger.warn("Sheet is empty or not found", { sheet: sheetName });
            return;
        }
        const [header, ...dataRows] = rows;
        const sheetData = dataRows.map((row) => header.reduce((acc, key, i) => {
            acc[key] = row[i] ?? "";
            return acc;
        }, {}));
        let existing = [];
        if (await fs_extra_1.default.pathExists(jsonFilePath)) {
            existing = await fs_extra_1.default.readJSON(jsonFilePath);
        }
        const oldHash = crypto_1.default.createHash("md5").update(JSON.stringify(existing)).digest("hex");
        const newHash = crypto_1.default.createHash("md5").update(JSON.stringify(sheetData)).digest("hex");
        if (oldHash === newHash) {
            logger_1.logger.debug("Sheet has no changes", { sheet: sheetName });
            return;
        }
        await fs_extra_1.default.writeJSON(jsonFilePath, sheetData, { spaces: 2 });
        logger_1.logger.info("Sheet synced successfully", {
            sheet: sheetName,
            targetFile: fileName,
            rowCount: sheetData.length,
        });
        const logEntry = {
            timestamp: new Date().toISOString(),
            sheet: sheetName,
            jsonFile: fileName,
            rows: sheetData.length,
            lastRowHash: crypto_1.default.createHash("md5")
                .update(JSON.stringify(sheetData[sheetData.length - 1] || {}))
                .digest("hex"),
        };
        let logData = [];
        if (await fs_extra_1.default.pathExists(LOG_FILE)) {
            logData = await fs_extra_1.default.readJSON(LOG_FILE);
        }
        logData.push(logEntry);
        await fs_extra_1.default.writeJSON(LOG_FILE, logData, { spaces: 2 });
    }
    catch (err) {
        logger_1.logger.error("Sheet sync failed", err, { sheet: sheetName, targetFile: path_1.default.basename(jsonFilePath) });
        throw err;
    }
}
/**
 * Append RSVP row(s) to the RSVPs sheet.
 * Ensure the spreadsheet has an "RSVPs" tab with headers: timestamp, invite_token, guest_id, attending_wedding, attending_braai, dietary_requirements
 */
async function appendRsvpToSheet(rows) {
    if (rows.length === 0)
        return;
    logger_1.logger.debug("Appending RSVPs to sheet", { rowCount: rows.length, guestIds: rows.map((r) => r.guest_id) });
    const sheets = await authSheets();
    const values = rows.map((r) => [
        r.timestamp,
        r.invite_token,
        r.guest_id,
        r.attending_wedding === true ? "Yes" : r.attending_wedding === false ? "No" : "",
        r.attending_braai === true ? "Yes" : r.attending_braai === false ? "No" : "",
        r.dietary_requirements || "",
    ]);
    await sheets.spreadsheets.values.append({
        spreadsheetId: exports.SPREADSHEET_ID,
        range: `${RSVPS_SHEET}!A:F`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values },
    });
    logger_1.logger.info("RSVPs appended to sheet", { rowCount: rows.length });
}
const SONG_REQUESTS_SHEET = "Song_Requests";
/**
 * Append song request(s) to the Song_Requests sheet. Supports batching.
 * Headers: timestamp, invite_token, guest_id, song_title, artist
 */
async function appendSongRequestToSheet(entries) {
    const rows = Array.isArray(entries) ? entries : [entries];
    if (rows.length === 0)
        return;
    logger_1.logger.debug("Appending song requests to sheet", { rowCount: rows.length });
    const sheets = await authSheets();
    const values = rows.map((r) => [
        r.timestamp,
        r.invite_token,
        r.guest_id,
        r.song_title,
        r.artist || "",
    ]);
    await sheets.spreadsheets.values.append({
        spreadsheetId: exports.SPREADSHEET_ID,
        range: `${SONG_REQUESTS_SHEET}!A:E`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values },
    });
    logger_1.logger.info("Song requests appended to sheet", { rowCount: rows.length });
}
