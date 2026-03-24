"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("./lib/logger");
const invite_1 = __importDefault(require("./routes/invite"));
const rsvp_1 = __importDefault(require("./routes/rsvp"));
const songRequest_1 = __importDefault(require("./routes/songRequest"));
const websiteInfo_1 = __importDefault(require("./routes/websiteInfo"));
const manual_trigger_1 = __importDefault(require("./routes/manual_trigger"));
const fullSync_1 = require("./sync/fullSync");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Behind reverse proxy (Railway, Render, nginx): correct client IP for rate limits
if (process.env.TRUST_PROXY === "1" || process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
// Security headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Allow inline styles/scripts if needed for frontend
}));
// CORS - restrict origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:5713", "http://localhost:5173", "http://127.0.0.1:5713", "http://127.0.0.1:5173"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
}));
// Limit JSON body size
app.use(express_1.default.json({ limit: "10kb" }));
// General rate limit - 100 requests per 15 min per IP
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", generalLimiter);
// Stricter limit for write endpoints (RSVP, song request)
const writeLimiter = (0, express_rate_limit_1.default)({
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
            logger_1.logger.error(`Request ${req.method} ${req.path} → ${res.statusCode}`, undefined, context);
        }
        else if (res.statusCode >= 400) {
            logger_1.logger.warn(`Request ${req.method} ${req.path} → ${res.statusCode}`, context);
        }
        else {
            logger_1.logger.info(`${req.method} ${req.path}`, context);
        }
    });
    next();
});
app.use("/api/invite", invite_1.default);
app.use("/api/rsvp", rsvp_1.default);
app.use("/api/song-request", songRequest_1.default);
app.use("/api/website-info", websiteInfo_1.default);
app.use("/api", manual_trigger_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    logger_1.logger.info("Server started", {
        port: PORT,
        logLevel: process.env.LOG_LEVEL || "INFO",
        corsOrigins: allowedOrigins.length,
    });
    (0, fullSync_1.fullSync)();
});
// Hourly sync
node_cron_1.default.schedule("0 * * * *", () => {
    logger_1.logger.info("Hourly sheet sync triggered");
    (0, fullSync_1.fullSync)();
});
