import { google } from "googleapis";
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";

import { logger } from "../lib/logger";

const CREDENTIALS_PATH = path.join(__dirname, "../credentials/google-key.json");
const LOG_FILE = path.join(__dirname, "../data/sync_log.json");

export const SPREADSHEET_ID = process.env.SPREADSHEET_ID || "1jyuMv2Ek_wwQUmM-0LMZs79J2bCWIdTv6sZOUZvSAe0";
const RSVPS_SHEET = "RSVPs";

async function authSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

/**
 * Fetch Google Sheet, detect changes, write JSON and log if changed
 */
export async function syncSheetToJSON(
  spreadsheetId: string,
  sheetName: string,
  jsonFilePath: string
) {
  const fileName = path.basename(jsonFilePath);
  logger.info("Sheet sync started", { sheet: sheetName, targetFile: fileName });

  try {
    const sheets = await authSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      logger.warn("Sheet is empty or not found", { sheet: sheetName });
      return;
    }

    const [header, ...dataRows] = rows;
    const sheetData = dataRows.map((row) =>
      header.reduce((acc: Record<string, unknown>, key, i) => {
        acc[key] = row[i] ?? "";
        return acc;
      }, {})
    );

    let existing: unknown[] = [];
    if (await fs.pathExists(jsonFilePath)) {
      existing = await fs.readJSON(jsonFilePath);
    }

    const oldHash = crypto.createHash("md5").update(JSON.stringify(existing)).digest("hex");
    const newHash = crypto.createHash("md5").update(JSON.stringify(sheetData)).digest("hex");

    if (oldHash === newHash) {
      logger.debug("Sheet has no changes", { sheet: sheetName });
      return;
    }

    await fs.writeJSON(jsonFilePath, sheetData, { spaces: 2 });
    logger.info("Sheet synced successfully", {
      sheet: sheetName,
      targetFile: fileName,
      rowCount: sheetData.length,
    });

    const logEntry = {
      timestamp: new Date().toISOString(),
      sheet: sheetName,
      jsonFile: fileName,
      rows: sheetData.length,
      lastRowHash: crypto.createHash("md5")
        .update(JSON.stringify(sheetData[sheetData.length - 1] || {}))
        .digest("hex"),
    };

    let logData: unknown[] = [];
    if (await fs.pathExists(LOG_FILE)) {
      logData = await fs.readJSON(LOG_FILE);
    }
    logData.push(logEntry);
    await fs.writeJSON(LOG_FILE, logData, { spaces: 2 });
  } catch (err) {
    logger.error("Sheet sync failed", err, { sheet: sheetName, targetFile: path.basename(jsonFilePath) });
    throw err;
  }
}

export interface RsvpRow {
  timestamp: string;
  invite_token: string;
  guest_id: string;
  attending_wedding?: boolean | null;
  attending_braai?: boolean | null;
  dietary_requirements: string;
}

/**
 * Append RSVP row(s) to the RSVPs sheet.
 * Ensure the spreadsheet has an "RSVPs" tab with headers: timestamp, invite_token, guest_id, attending_wedding, attending_braai, dietary_requirements
 */
export async function appendRsvpToSheet(rows: RsvpRow[]): Promise<void> {
  if (rows.length === 0) return;

  logger.debug("Appending RSVPs to sheet", { rowCount: rows.length, guestIds: rows.map((r) => r.guest_id) });

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
    spreadsheetId: SPREADSHEET_ID,
    range: `${RSVPS_SHEET}!A:F`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });

  logger.info("RSVPs appended to sheet", { rowCount: rows.length });
}
