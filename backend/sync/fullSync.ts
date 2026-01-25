import path from "path";
import { queueSyncSheet } from "../queue/sheetQueue";

const SPREADSHEET_ID = "1jyuMv2Ek_wwQUmM-0LMZs79J2bCWIdTv6sZOUZvSAe0";

export function fullSync() {
  const invitesJson = path.join(__dirname, "../data/invites.json");
  const guestsJson = path.join(__dirname, "../data/guests.json");
  const accommodationJson = path.join(__dirname, "../data/accommodation.json");

  queueSyncSheet(SPREADSHEET_ID, "Invites", invitesJson);
  queueSyncSheet(SPREADSHEET_ID, "Guests", guestsJson);
  queueSyncSheet(SPREADSHEET_ID, "Accommodation", accommodationJson);
}
