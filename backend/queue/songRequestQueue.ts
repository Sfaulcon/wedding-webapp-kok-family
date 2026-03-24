import fs from "fs-extra";

import { logger } from "../lib/logger";
import { dataFile } from "../lib/paths";
import { enqueueSongRequestSheetAppend } from "./sheetsWriteQueue";

const SONG_REQUESTS_FILE = dataFile("song_requests.json");

/**
 * Persist song request to JSON immediately (no data loss), then enqueue Sheet append.
 * Returns after JSON is written; Sheet sync happens asynchronously via batched queue.
 */
export async function appendSongRequestToJSON(entry: {
  invite_token: string;
  guest_id: string;
  song_title: string;
  artist: string;
}): Promise<void> {
  let data: Array<Record<string, unknown>> = [];
  if (await fs.pathExists(SONG_REQUESTS_FILE)) {
    data = (await fs.readJSON(SONG_REQUESTS_FILE)) as Array<Record<string, unknown>>;
  }

  const timestamped = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  data.push(timestamped);
  await fs.writeJSON(SONG_REQUESTS_FILE, data, { spaces: 2 });

  logger.info("Song request saved to JSON", {
    invite_token: entry.invite_token,
    guest_id: entry.guest_id,
    song_title: entry.song_title,
  });

  // Enqueue for batched Sheet append (no await - fire and forget)
  enqueueSongRequestSheetAppend({
    timestamp: timestamped.timestamp,
    invite_token: entry.invite_token,
    guest_id: entry.guest_id,
    song_title: entry.song_title,
    artist: entry.artist || "",
  });
}
