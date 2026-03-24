# Wedding Web App – Backend

Express API for the wedding web app. Serves invite data, RSVPs, song requests, and syncs from Google Sheets.

## Tech Stack

- **Express 5** – HTTP API
- **Google Sheets API** – Data sync
- **node-cron** – Hourly sync
- **Helmet** – Security headers
- **express-rate-limit** – Rate limiting

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the backend root:

```env
PORT=4000
SPREADSHEET_ID=your-google-sheet-id
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
LOG_LEVEL=INFO
```

| Variable        | Description                          | Default |
|-----------------|--------------------------------------|---------|
| `PORT`          | Server port                          | 4000    |
| `SPREADSHEET_ID`| Google Sheet ID                      | Required|
| `ALLOWED_ORIGINS`| CORS origins (comma-separated)      | localhost|
| `LOG_LEVEL`     | Logging level                        | INFO    |

### 3. Google Sheets credentials

1. Create a Google Cloud project and enable the Google Sheets API.
2. Create a Service Account and download its JSON key.
3. Save the key as `credentials/google-key.json` in the backend folder.
4. Share your wedding spreadsheet with the service account email (Editor access).

### 4. Google Sheets structure

Add the required tabs to your spreadsheet. See [SHEETS_SETUP.md](SHEETS_SETUP.md) for full details.

**Required sheets:**

- Invites
- Guests
- Venue_Payments
- Website_Info
- Food_Options
- Story
- Accommodation_Options
- RSVPs
- Song_Requests

## Scripts

| Command       | Description                     |
|---------------|---------------------------------|
| `npm run dev` | Start with hot reload           |

## API Endpoints

| Method | Path                 | Description                    |
|--------|----------------------|--------------------------------|
| GET    | `/api/website-info`  | Dress code, gifts, food, story, banking |
| GET    | `/api/invite/:token` | Invite + guests + options      |
| POST   | `/api/rsvp`          | Submit RSVP                    |
| POST   | `/api/song-request`  | Submit song request            |

## Data Sync

- **On startup**: Full sync from Google Sheets to `data/*.json`
- **Hourly**: Automatic sync via cron

Manual sync: `POST /api/sync/manual` (if implemented)

## Data Files

JSON files in `data/` are written by the sync process:

- `invites.json`
- `guests.json`
- `venue_payments.json`
- `website_info.json`
- `food_options.json`
- `story.json`
- `accommodation.json`
- `rsvps_from_sheet.json`
- `song_requests.json`
