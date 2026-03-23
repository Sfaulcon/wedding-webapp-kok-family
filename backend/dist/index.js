"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
const invite_1 = __importDefault(require("./routes/invite"));
const rsvp_1 = __importDefault(require("./routes/rsvp"));
const manual_trigger_1 = __importDefault(require("./routes/manual_trigger"));
const fullSync_1 = require("./sync/fullSync");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/invite", invite_1.default);
app.use("/api/rsvp", rsvp_1.default);
app.use("/api", manual_trigger_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
// Hourly sync
node_cron_1.default.schedule("0 * * * *", async () => {
    console.log("⏱ Hourly sheet sync triggered");
    await (0, fullSync_1.fullSync)();
});
