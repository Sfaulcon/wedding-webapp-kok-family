import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

import inviteRoutes from "./routes/invite";
import rsvpRoutes from "./routes/rsvp";
import manualTriggerRoutes from "./routes/manual_trigger";
import { fullSync } from "./sync/fullSync";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/invite", inviteRoutes);
app.use("/api/rsvp", rsvpRoutes);
app.use("/api", manualTriggerRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    }
    );

// Hourly sync
cron.schedule("0 * * * *", async () => {
  console.log("⏱ Hourly sheet sync triggered");
  await fullSync();
});