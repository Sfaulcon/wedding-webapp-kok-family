import fs from "fs-extra";
import path from "path";

import { logger } from "../lib/logger";
import { appendRsvpToSheet } from "../sync/sheetsSync";

interface GuestRSVP {
    timestamp: string;
    invite_token: string;
    guest_id: string;
    attending_wedding?: boolean;
    attending_braai?: boolean;
    dietary_requirements: string;
    needs_shuttle?: boolean;
    selected_accommodation?: string;
    synced?: boolean;
}

interface RSVPSubmission {
    invite_token: string;
    responses: GuestRSVP[];
}

const queue: (() => Promise<void>)[] = [];
let processing = false;

const RSVPS_FILE = path.join(__dirname, "../data/rsvps.json");
const LOG_FILE = path.join(__dirname, "../data/rsvp_log.json");

export function enqueueRSVP(task: () => Promise<void>) {
    queue.push(task);
    logger.debug("RSVP task enqueued", { queueLength: queue.length });
    processQueue();
}

async function processQueue() {
    if (processing || queue.length === 0) return;
    processing = true;

    const task = queue.shift();
    if (!task) {
        processing = false;
        return;
    }

    logger.debug("RSVP queue: processing task", { remaining: queue.length });
    try {
        await task();
        logger.debug("RSVP queue: task completed");
    } catch (err) {
        logger.error("RSVP queue: task failed", err, { remaining: queue.length });
    } finally {
        processing = false;
        processQueue();
    }
}

export async function appendRSVPToJSON(rsvp: RSVPSubmission) {
    enqueueRSVP(async () => {
        let data: GuestRSVP[] = [];
        if (await fs.pathExists(RSVPS_FILE)) {
            data = await fs.readJSON(RSVPS_FILE);
        }

        const timestamped = rsvp.responses.map(resp => ({
            ...resp,
            timestamp: new Date().toISOString(),
            synced: false
        }));

        data.push(...timestamped);
        await fs.writeJSON(RSVPS_FILE, data, { spaces: 2 });
        logger.info("RSVP saved to JSON", {
            invite_token: rsvp.invite_token,
            guest_ids: rsvp.responses.map((r) => r.guest_id),
            totalRsvpsInFile: data.length,
        });

        try {
            await appendRsvpToSheet(timestamped.map((r) => ({
                timestamp: r.timestamp,
                invite_token: r.invite_token,
                guest_id: r.guest_id,
                attending_wedding: r.attending_wedding,
                attending_braai: r.attending_braai,
                dietary_requirements: r.dietary_requirements || "",
            })));
            logger.info("RSVP pushed to Google Sheet", { invite_token: rsvp.invite_token, guest_ids: rsvp.responses.map((r) => r.guest_id) });
        } catch (err) {
            logger.error("Failed to push RSVP to sheet", err, { invite_token: rsvp.invite_token, guest_ids: rsvp.responses.map((r) => r.guest_id) });
        }

        const logEntry = {
            timestamp: new Date().toISOString(),
            action: "RSVP_SUBMITTED",
            invite_token: rsvp.invite_token,
            guest_ids: rsvp.responses.map((r) => r.guest_id),
        };

        let logData: unknown[] = [];
        if (await fs.pathExists(LOG_FILE)) {
            logData = await fs.readJSON(LOG_FILE);
        }
        logData.push(logEntry);
        await fs.writeJSON(LOG_FILE, logData, { spaces: 2 });
    });
}