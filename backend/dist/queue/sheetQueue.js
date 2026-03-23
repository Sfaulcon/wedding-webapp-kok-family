"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueSheetSync = enqueueSheetSync;
exports.queueSyncSheet = queueSyncSheet;
const sheetsSync_1 = require("../sync/sheetsSync");
const queue = [];
let processing = false;
function enqueueSheetSync(task) {
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
function queueSyncSheet(spreadsheetId, sheetName, jsonFilePath) {
    enqueueSheetSync(() => (0, sheetsSync_1.syncSheetToJSON)(spreadsheetId, sheetName, jsonFilePath));
}
