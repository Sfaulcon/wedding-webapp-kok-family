import fs from "fs-extra";
import path from "path";

interface GuestRSVP {
    timestamp: string;
    invite_token: string;
    guest_id: string;
    attending_wedding?: boolean;
    attending_braai?: boolean;
    dietary_requirements: string;
    needs_shuttle?: boolean;
    selected_accomodation?: string;
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
    processQueue();
}

async function processQueue() {
    if (processing || queue.length === 0) return;
    processing = true;

    const task = queue.shift();
    if (!task) return;

    try {
        await task();
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

        // Logging of submission
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: "RSVP_SUBMITTED",
            invite_token: rsvp.invite_token,
            guest_ids: rsvp.responses.map(r => r.guest_id)
        };

        let logData: any[] = [];
        if (await fs.pathExists(LOG_FILE)) {
            logData = await fs.readJSON(LOG_FILE);
        }
        logData.push(logEntry);
        await fs.writeJSON(LOG_FILE, logData, { spaces: 2 });

        console.log(`RSVP queued and logged for invite ${rsvp.invite_token}`);
    });
}