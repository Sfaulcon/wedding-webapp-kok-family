"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendRSVPToJSON = appendRSVPToJSON;
const fs_extra_1 = __importDefault(require("fs-extra"));
const logger_1 = require("../lib/logger");
const paths_1 = require("../lib/paths");
const sheetsWriteQueue_1 = require("./sheetsWriteQueue");
const RSVPS_FILE = (0, paths_1.dataFile)("rsvps.json");
const LOG_FILE = (0, paths_1.dataFile)("rsvp_log.json");
/**
 * Persist RSVP to JSON immediately (no data loss), then enqueue Sheet append.
 * Returns after JSON is written; Sheet sync happens asynchronously via batched queue.
 */
async function appendRSVPToJSON(rsvp) {
    let data = [];
    if (await fs_extra_1.default.pathExists(RSVPS_FILE)) {
        data = (await fs_extra_1.default.readJSON(RSVPS_FILE));
    }
    const timestamped = rsvp.responses.map((resp) => ({
        ...resp,
        timestamp: new Date().toISOString(),
        synced: false,
        dietary_requirements: resp.dietary_requirements ?? "",
    }));
    data.push(...timestamped);
    await fs_extra_1.default.writeJSON(RSVPS_FILE, data, { spaces: 2 });
    logger_1.logger.info("RSVP saved to JSON", {
        invite_token: rsvp.invite_token,
        guest_ids: rsvp.responses.map((r) => r.guest_id),
        totalRsvpsInFile: data.length,
    });
    // Enqueue for batched Sheet append (no await - fire and forget)
    const rows = timestamped.map((r) => ({
        timestamp: r.timestamp,
        invite_token: r.invite_token,
        guest_id: r.guest_id,
        attending_wedding: r.attending_wedding,
        attending_braai: r.attending_braai,
        dietary_requirements: r.dietary_requirements || "",
    }));
    (0, sheetsWriteQueue_1.enqueueRsvpSheetAppend)(rows);
    // Log
    const logEntry = {
        timestamp: new Date().toISOString(),
        action: "RSVP_SUBMITTED",
        invite_token: rsvp.invite_token,
        guest_ids: rsvp.responses.map((r) => r.guest_id),
    };
    let logData = [];
    if (await fs_extra_1.default.pathExists(LOG_FILE)) {
        logData = (await fs_extra_1.default.readJSON(LOG_FILE));
    }
    logData.push(logEntry);
    await fs_extra_1.default.writeJSON(LOG_FILE, logData, { spaces: 2 });
}
