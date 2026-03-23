"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncSheetToJSON = syncSheetToJSON;
const googleapis_1 = require("googleapis");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const CREDENTIALS_PATH = path_1.default.join(__dirname, "../credentials/google-key.json");
const LOG_FILE = path_1.default.join(__dirname, "../data/sync_log.json");
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
    const sheetData = dataRows.map((row) => header.reduce((acc, key, i) => {
        acc[key] = row[i] ?? "";
        return acc;
    }, {}));
    // Read existing JSON
    let existing = [];
    if (await fs_extra_1.default.pathExists(jsonFilePath)) {
        existing = await fs_extra_1.default.readJSON(jsonFilePath);
    }
    // Detect changes via hash
    const oldHash = crypto_1.default.createHash("md5").update(JSON.stringify(existing)).digest("hex");
    const newHash = crypto_1.default.createHash("md5").update(JSON.stringify(sheetData)).digest("hex");
    if (oldHash === newHash) {
        console.log(`${sheetName} has no changes`);
        return;
    }
    // Write updated JSON
    await fs_extra_1.default.writeJSON(jsonFilePath, sheetData, { spaces: 2 });
    console.log(`${sheetName} synced to ${path_1.default.basename(jsonFilePath)}`);
    // Log the sync
    const logEntry = {
        timestamp: new Date().toISOString(),
        sheet: sheetName,
        jsonFile: path_1.default.basename(jsonFilePath),
        rows: sheetData.length,
        lastRowHash: crypto_1.default.createHash("md5")
            .update(JSON.stringify(sheetData[sheetData.length - 1] || {}))
            .digest("hex")
    };
    let logData = [];
    if (await fs_extra_1.default.pathExists(LOG_FILE)) {
        logData = await fs_extra_1.default.readJSON(LOG_FILE);
    }
    logData.push(logEntry);
    await fs_extra_1.default.writeJSON(LOG_FILE, logData, { spaces: 2 });
}
