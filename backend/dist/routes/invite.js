"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const INVITES_FILE = path_1.default.join(__dirname, "../data/invites.json");
const GUESTS_FILE = path_1.default.join(__dirname, "../data/guests.json");
const ACCOMMODATION_FILE = path_1.default.join(__dirname, "../data/accommodation.json");
// GET /api/invite/:token
router.get("/:token", async (req, res) => {
    const token = req.params.token;
    const invites = await fs_extra_1.default.readJSON(INVITES_FILE);
    const guests = await fs_extra_1.default.readJSON(GUESTS_FILE);
    const accommodation = await fs_extra_1.default.readJSON(ACCOMMODATION_FILE);
    const invite = invites.find((i) => i.invite_token === token);
    if (!invite)
        return res.status(404).json({ message: "Invite not found" });
    const guestsForInvite = guests.filter((g) => g.invite_token === token);
    res.json({
        group_name: invite.group_name,
        guests: guestsForInvite,
        accommodation_options: accommodation
    });
});
exports.default = router;
