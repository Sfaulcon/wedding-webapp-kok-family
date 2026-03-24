import fs from "fs-extra";
import path from "path";

import { logger } from "../lib/logger";
import { appendSongRequestToSheet } from "../sync/sheetsSync";

const SONG_REQUESTS_FILE = path.join(__dirname, "../data/song_requests.json");

const queue: (() => Promise<void>)[] = [];
let processing = false;

function enqueue(task: () => Promise<void>) {
  queue.push(task);
  logger.debug("Song request task enqueued", { queueLength: queue.length });
  processQueue();
}

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  const task = queue.shift();
  if (!task) {
    processing = false;
    return;
  }

  try {
    await task();
  } catch (err) {
    logger.error("Song request queue: task failed", err);
  } finally {
    processing = false;
    processQueue();
  }
}

export async function appendSongRequestToJSON(entry: {
  invite_token: string;
  guest_id: string;
  song_title: string;
  artist: string;
}) {
  enqueue(async () => {
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

    try {
      await appendSongRequestToSheet(timestamped);
      logger.info("Song request pushed to Google Sheet");
    } catch (err) {
      logger.warn("Failed to push song request to sheet (tab may not exist yet)", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}
