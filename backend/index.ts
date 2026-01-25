import express from "express";
import bodyParser from "body-parser";
import cron from "node-cron";
import { fullSync } from "./sync/fullSync";
import inviteRoutes from "./routes/invite";
import rsvpRoutes from "./routes/rsvp";

const app = express();
app.use(bodyParser.json());

app.use("/api/invite", inviteRoutes);
app.use("/api/rsvp", rsvpRoutes);

cron.schedule("0 * * * *", async () => {
  console.log("Starting hourly sheet → JSON sync...");
  fullSync();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));