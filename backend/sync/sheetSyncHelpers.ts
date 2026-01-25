import { google } from "googleapis";
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";

const CREDENTIALS_PATH = path.join(__dirname, "../credentials/google-key.json");
const LOG_FILE = path.join(__dirname, "../data/sync_log.json");

const queue: (() => Promise<void>)[] = [];
let processing = false;

async function authSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Queueing system for syncs
export function enqueueSync(task: () => Promise<void>) {
  queue.push(task);
  processQueue();
}

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  const task = queue.shift();
  if (!task) return;

  try {
    await task();
  } finally {
    processing = false;
    processQueue();
  }
}

export function syncSheetToJSON(
  spreadsheetId: string,
  sheetName: string,
  jsonPath: string
) {
  enqueueSync(async () => {
    const sheets = await authSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log(`Sheet ${sheetName} is empty`);
      return;
    }

    const [header, ...dataRows] = rows;
    const sheetData = dataRows.map((row) =>
      header.reduce((acc: any, key, i) => {
        acc[key] = row[i] ?? "";
        return acc;
      }, {})
    );

    // Read existing JSON
    let existing: any[] = [];
    if (await fs.pathExists(jsonPath)) {
      existing = await fs.readJSON(jsonPath);
    }

    const oldHash = crypto
      .createHash("md5")
      .update(JSON.stringify(existing))
      .digest("hex");
    const newHash = crypto
      .createHash("md5")
      .update(JSON.stringify(sheetData))
      .digest("hex");

    if (oldHash === newHash) {
      console.log(`${sheetName} has no changes`);
      return;
    }

    // Write updated JSON
    await fs.writeJSON(jsonPath, sheetData, { spaces: 2 });
    console.log(`${sheetName} synced to ${path.basename(jsonPath)}`);

    // Log the sync
    const logEntry = {
      timestamp: new Date().toISOString(),
      sheet: sheetName,
      jsonFile: path.basename(jsonPath),
      rows: sheetData.length,
      lastRowHash: crypto
        .createHash("md5")
        .update(JSON.stringify(sheetData[sheetData.length - 1] || {}))
        .digest("hex"),
    };

    let logData: any[] = [];
    if (await fs.pathExists(LOG_FILE)) {
      logData = await fs.readJSON(LOG_FILE);
    }
    logData.push(logEntry);
    await fs.writeJSON(LOG_FILE, logData, { spaces: 2 });
  });
}
