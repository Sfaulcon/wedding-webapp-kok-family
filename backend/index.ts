import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

import { logger } from "./lib/logger";
import inviteRoutes from "./routes/invite";
import rsvpRoutes from "./routes/rsvp";
import manualTriggerRoutes from "./routes/manual_trigger";
import { fullSync } from "./sync/fullSync";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const context = { method: req.method, path: req.path, status: res.statusCode, durationMs: duration };
    if (res.statusCode >= 500) {
      logger.error(`Request ${req.method} ${req.path} → ${res.statusCode}`, undefined, context);
    } else if (res.statusCode >= 400) {
      logger.warn(`Request ${req.method} ${req.path} → ${res.statusCode}`, context);
    } else {
      logger.info(`${req.method} ${req.path}`, context);
    }
  });
  next();
});

app.use("/api/invite", inviteRoutes);
app.use("/api/rsvp", rsvpRoutes);
app.use("/api", manualTriggerRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info("Server started", { port: PORT, logLevel: process.env.LOG_LEVEL || "INFO" });
  fullSync();
});

// Hourly sync
cron.schedule("0 * * * *", () => {
  logger.info("Hourly sheet sync triggered");
  fullSync();
});