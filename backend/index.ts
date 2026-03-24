import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cron from "node-cron";

import { logger } from "./lib/logger";
import inviteRoutes from "./routes/invite";
import rsvpRoutes from "./routes/rsvp";
import songRequestRoutes from "./routes/songRequest";
import websiteInfoRoutes from "./routes/websiteInfo";
import manualTriggerRoutes from "./routes/manual_trigger";
import { fullSync } from "./sync/fullSync";

dotenv.config();

const app = express();

// Behind reverse proxy (Railway, Render, nginx): correct client IP for rate limits
if (process.env.TRUST_PROXY === "1" || process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles/scripts if needed for frontend
}));

// CORS - restrict origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5713", "http://localhost:5173", "http://127.0.0.1:5713", "http://127.0.0.1:5173"];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
}));

// Limit JSON body size
app.use(express.json({ limit: "10kb" }));

// General rate limit - 100 requests per 15 min per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", generalLimiter);

// Stricter limit for write endpoints (RSVP, song request)
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/rsvp", writeLimiter);
app.use("/api/song-request", writeLimiter);

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
app.use("/api/song-request", songRequestRoutes);
app.use("/api/website-info", websiteInfoRoutes);
app.use("/api", manualTriggerRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info("Server started", {
    port: PORT,
    logLevel: process.env.LOG_LEVEL || "INFO",
    corsOrigins: allowedOrigins.length,
  });
  fullSync();
});

// Hourly sync
cron.schedule("0 * * * *", () => {
  logger.info("Hourly sheet sync triggered");
  fullSync();
});
