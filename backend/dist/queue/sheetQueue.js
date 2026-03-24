"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueSheetSync = enqueueSheetSync;
exports.queueSyncSheet = queueSyncSheet;
const path_1 = __importDefault(require("path"));
const logger_1 = require("../lib/logger");
const sheetsSync_1 = require("../sync/sheetsSync");
const queue = [];
let processing = false;
function enqueueSheetSync(task) {
    queue.push(task);
    logger_1.logger.debug("Sheet sync task enqueued", { queueLength: queue.length });
    processQueue();
}
async function processQueue() {
    if (processing || queue.length === 0)
        return;
    processing = true;
    const task = queue.shift();
    if (!task) {
        processing = false;
        return;
    }
    logger_1.logger.debug("Sheet queue: processing task", { remaining: queue.length });
    try {
        await task();
        logger_1.logger.debug("Sheet queue: task completed");
    }
    catch (err) {
        logger_1.logger.error("Sheet queue: task failed", err, { remaining: queue.length });
    }
    finally {
        processing = false;
        processQueue();
    }
}
function queueSyncSheet(spreadsheetId, sheetName, jsonFilePath) {
    const fileName = path_1.default.basename(jsonFilePath);
    logger_1.logger.info("Sheet sync queued", { sheet: sheetName, targetFile: fileName });
    enqueueSheetSync(() => (0, sheetsSync_1.syncSheetToJSON)(spreadsheetId, sheetName, jsonFilePath));
}
