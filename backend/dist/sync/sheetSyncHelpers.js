"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueSync = enqueueSync;
exports.syncSheetToJSON = syncSheetToJSON;
const googleapis_1 = require("googleapis");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const CREDENTIALS_PATH = path_1.default.join(__dirname, "../credentials/google-key.json");
const LOG_FILE = path_1.default.join(__dirname, "../data/sync_log.json");
const queue = [];
let processing = false;
async function authSheets() {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return googleapis_1.google.sheets({ version: "v4", auth });
}
// Queueing system for syncs
function enqueueSync(task) {
    queue.push(task);
    processQueue();
}
async function processQueue() {
    if (processing || queue.length === 0)
        return;
    processing = true;
    const task = queue.shift();
    if (!task)
        return;
    try {
        await task();
    }
    finally {
        processing = false;
        processQueue();
    }
}
function syncSheetToJSON(spreadsheetId, sheetName, jsonPath) {
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
        const sheetData = dataRows.map((row) => header.reduce((acc, key, i) => {
            acc[key] = row[i] ?? "";
            return acc;
        }, {}));
        // Read existing JSON
        let existing = [];
        if (await fs_extra_1.default.pathExists(jsonPath)) {
            existing = await fs_extra_1.default.readJSON(jsonPath);
        }
        const oldHash = crypto_1.default
            .createHash("md5")
            .update(JSON.stringify(existing))
            .digest("hex");
        const newHash = crypto_1.default
            .createHash("md5")
            .update(JSON.stringify(sheetData))
            .digest("hex");
        if (oldHash === newHash) {
            console.log(`${sheetName} has no changes`);
            return;
        }
        // Write updated JSON
        await fs_extra_1.default.writeJSON(jsonPath, sheetData, { spaces: 2 });
        console.log(`${sheetName} synced to ${path_1.default.basename(jsonPath)}`);
        // Log the sync
        const logEntry = {
            timestamp: new Date().toISOString(),
            sheet: sheetName,
            jsonFile: path_1.default.basename(jsonPath),
            rows: sheetData.length,
            lastRowHash: crypto_1.default
                .createHash("md5")
                .update(JSON.stringify(sheetData[sheetData.length - 1] || {}))
                .digest("hex"),
        };
        let logData = [];
        if (await fs_extra_1.default.pathExists(LOG_FILE)) {
            logData = await fs_extra_1.default.readJSON(LOG_FILE);
        }
        logData.push(logEntry);
        await fs_extra_1.default.writeJSON(LOG_FILE, logData, { spaces: 2 });
    });
}
