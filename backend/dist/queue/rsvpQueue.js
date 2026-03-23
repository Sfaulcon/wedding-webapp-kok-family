"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueRSVP = enqueueRSVP;
exports.appendRSVPToJSON = appendRSVPToJSON;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const queue = [];
let processing = false;
const RSVPS_FILE = path_1.default.join(__dirname, "../data/rsvps.json");
const LOG_FILE = path_1.default.join(__dirname, "../data/rsvp_log.json");
function enqueueRSVP(task) {
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
async function appendRSVPToJSON(rsvp) {
    enqueueRSVP(async () => {
        let data = [];
        if (await fs_extra_1.default.pathExists(RSVPS_FILE)) {
            data = await fs_extra_1.default.readJSON(RSVPS_FILE);
        }
        const timestamped = rsvp.responses.map(resp => ({
            ...resp,
            timestamp: new Date().toISOString(),
            synced: false
        }));
        data.push(...timestamped);
        await fs_extra_1.default.writeJSON(RSVPS_FILE, data, { spaces: 2 });
        // Logging of submission
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: "RSVP_SUBMITTED",
            invite_token: rsvp.invite_token,
            guest_ids: rsvp.responses.map(r => r.guest_id)
        };
        let logData = [];
        if (await fs_extra_1.default.pathExists(LOG_FILE)) {
            logData = await fs_extra_1.default.readJSON(LOG_FILE);
        }
        logData.push(logEntry);
        await fs_extra_1.default.writeJSON(LOG_FILE, logData, { spaces: 2 });
        console.log(`RSVP queued and logged for invite ${rsvp.invite_token}`);
    });
}
