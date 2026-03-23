import path from "path";

import { logger } from "../lib/logger";
import { syncSheetToJSON } from "../sync/sheetsSync";

const queue: (() => Promise<void>)[] = [];
let processing = false;

export function enqueueSheetSync(task: () => Promise<void>) {
  queue.push(task);
  logger.debug("Sheet sync task enqueued", { queueLength: queue.length });
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

  logger.debug("Sheet queue: processing task", { remaining: queue.length });
  try {
    await task();
    logger.debug("Sheet queue: task completed");
  } catch (err) {
    logger.error("Sheet queue: task failed", err, { remaining: queue.length });
  } finally {
    processing = false;
    processQueue();
  }
}

export function queueSyncSheet(spreadsheetId: string, sheetName: string, jsonFilePath: string) {
  const fileName = path.basename(jsonFilePath);
  logger.info("Sheet sync queued", { sheet: sheetName, targetFile: fileName });
  enqueueSheetSync(() => syncSheetToJSON(spreadsheetId, sheetName, jsonFilePath));
}
