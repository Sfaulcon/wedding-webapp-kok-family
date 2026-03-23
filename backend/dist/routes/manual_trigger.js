"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fullSync_1 = require("../sync/fullSync");
const router = (0, express_1.Router)();
// POST /api/sync → manual trigger
router.post("/", async (req, res) => {
    try {
        (0, fullSync_1.fullSync)();
        res.json({ message: "Sheets sync triggered (queued)" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Sync failed", error: err });
    }
});
exports.default = router;
