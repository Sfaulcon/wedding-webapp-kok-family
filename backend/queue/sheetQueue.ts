import { syncSheetToJSON } from "../sync/sheetsSync";
import path from "path";

const queue: (() => Promise<void>)[] = [];
let processing = false;

export function enqueueSheetSync(task: () => Promise<void>) {
  queue.push(task);
  processQueue();
}

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  const task = queue.shift();
  if (!task) return;

  try {
    await task();
  } finally {
    processing = false;
    processQueue();
  }
}

export function queueSyncSheet(spreadsheetId: string, sheetName: string, jsonFilePath: string) {
  enqueueSheetSync(() => syncSheetToJSON(spreadsheetId, sheetName, jsonFilePath));
}
