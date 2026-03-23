"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rsvpQueue_1 = require("../queue/rsvpQueue");
const router = (0, express_1.Router)();
// POST /api/rsvp/:token
router.post("/:token", async (req, res) => {
    const token = req.params.token;
    const rsvp = req.body; // should match RSVPSubmission
    try {
        await (0, rsvpQueue_1.appendRSVPToJSON)({ invite_token: token, responses: rsvp.responses });
        res.json({ message: "RSVP queued successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to queue RSVP" });
    }
});
exports.default = router;
