/**
 * Unified queue for Google Sheets write operations.
 * Batches RSVPs and Song Requests to avoid rate limits and data loss.
 *
 * - Minimum delay between API calls (configurable)
 * - Batch size limits
 * - Retry with exponential backoff on failure
 */

import { logger } from "../lib/logger";
import { appendRsvpToSheet, appendSongRequestToSheet, type RsvpRow } from "../sync/sheetsSync";
import type { SongRequestRow } from "../sync/sheetsSync";

const MIN_DELAY_MS = Number(process.env.SHEETS_WRITE_DELAY_MS) || 2000; // 2s between API calls (Google: ~100 req/100s)
const BATCH_SIZE_RSVP = Number(process.env.SHEETS_BATCH_SIZE_RSVP) || 20;
const BATCH_SIZE_SONG = Number(process.env.SHEETS_BATCH_SIZE_SONG) || 20;
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 5000;

type QueueItem =
  | { type: "rsvp"; rows: RsvpRow[] }
  | { type: "song"; rows: SongRequestRow[] };

const queue: QueueItem[] = [];
let processing = false;
let lastApiCallAt = 0;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForRateLimit(): Promise<void> {
  const elapsed = Date.now() - lastApiCallAt;
  const wait = Math.max(0, MIN_DELAY_MS - elapsed);
  return delay(wait);
}

async function flushWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES - 1) {
        const backoff = RETRY_BASE_MS * Math.pow(2, attempt);
        logger.warn("Sheets write failed, retrying", {
          attempt: attempt + 1,
          maxRetries: MAX_RETRIES,
          backoffMs: backoff,
          error: err instanceof Error ? err.message : String(err),
        });
        await delay(backoff);
      }
    }
  }
  throw lastErr;
}

async function processQueue(): Promise<void> {
  if (processing || queue.length === 0) return;
  processing = true;

  // Collect batches by type - fill until we have at least one batch or queue is empty
  const rsvpBatch: RsvpRow[] = [];
  const songBatch: SongRequestRow[] = [];

  while (queue.length > 0 && (rsvpBatch.length < BATCH_SIZE_RSVP || songBatch.length < BATCH_SIZE_SONG)) {
    const item = queue.shift();
    if (!item) break;

    if (item.type === "rsvp") {
      rsvpBatch.push(...item.rows);
      if (rsvpBatch.length >= BATCH_SIZE_RSVP) break;
    } else {
      songBatch.push(...item.rows);
      if (songBatch.length >= BATCH_SIZE_SONG) break;
    }
  }

  let hasFailure = false;

  // Process RSVP batch
  if (rsvpBatch.length > 0) {
    try {
      await waitForRateLimit();
      await flushWithRetry(() => appendRsvpToSheet(rsvpBatch));
      lastApiCallAt = Date.now();
      logger.info("Sheets write: RSVPs batched", { count: rsvpBatch.length });
    } catch (err) {
      logger.error("Sheets write: RSVP batch failed", err, { count: rsvpBatch.length });
      queue.unshift({ type: "rsvp", rows: rsvpBatch });
      hasFailure = true;
    }
  }

  // Process song batch (separate API call, so wait again)
  if (songBatch.length > 0) {
    try {
      await waitForRateLimit();
      await flushWithRetry(() => appendSongRequestToSheet(songBatch));
      lastApiCallAt = Date.now();
      logger.info("Sheets write: song requests batched", { count: songBatch.length });
    } catch (err) {
      logger.error("Sheets write: song batch failed", err, { count: songBatch.length });
      queue.unshift({ type: "song", rows: songBatch });
      hasFailure = true;
    }
  }

  processing = false;
  if (queue.length > 0) {
    if (hasFailure) {
      setTimeout(processQueue, RETRY_BASE_MS);
    } else {
      setImmediate(processQueue);
    }
  }
}

/**
 * Enqueue RSVP rows for Sheet append. Call after persisting to JSON.
 */
export function enqueueRsvpSheetAppend(rows: RsvpRow[]): void {
  if (rows.length === 0) return;
  queue.push({ type: "rsvp", rows });
  logger.debug("Sheets write queue: RSVPs enqueued", {
    count: rows.length,
    queueLength: queue.length,
  });
  setImmediate(processQueue);
}

/**
 * Enqueue song request row(s) for Sheet append. Call after persisting to JSON.
 */
export function enqueueSongRequestSheetAppend(rows: SongRequestRow | SongRequestRow[]): void {
  const arr = Array.isArray(rows) ? rows : [rows];
  if (arr.length === 0) return;
  queue.push({ type: "song", rows: arr });
  logger.debug("Sheets write queue: song requests enqueued", {
    count: arr.length,
    queueLength: queue.length,
  });
  setImmediate(processQueue);
}

/**
 * Returns current queue length (for monitoring).
 */
export function getSheetsWriteQueueLength(): number {
  return queue.length;
}
