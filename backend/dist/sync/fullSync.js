"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullSync = fullSync;
const path_1 = __importDefault(require("path"));
const sheetQueue_1 = require("../queue/sheetQueue");
const SPREADSHEET_ID = "1jyuMv2Ek_wwQUmM-0LMZs79J2bCWIdTv6sZOUZvSAe0";
function fullSync() {
    const invitesJson = path_1.default.join(__dirname, "../data/invites.json");
    const guestsJson = path_1.default.join(__dirname, "../data/guests.json");
    const accommodationJson = path_1.default.join(__dirname, "../data/accommodation.json");
    (0, sheetQueue_1.queueSyncSheet)(SPREADSHEET_ID, "Invites", invitesJson);
    (0, sheetQueue_1.queueSyncSheet)(SPREADSHEET_ID, "Guests", guestsJson);
    (0, sheetQueue_1.queueSyncSheet)(SPREADSHEET_ID, "Accommodation", accommodationJson);
}
