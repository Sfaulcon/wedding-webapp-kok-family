# Wedding Web App – Frontend

React + TypeScript + Vite frontend for the wedding invitation web app.

## Tech Stack

- **React 19** – UI
- **Vite 7** – Build tool
- **Tailwind CSS 4** – Styling
- **React Router 7** – Routing
- **Lucide React** – Icons

## Scripts

| Command    | Description              |
|------------|--------------------------|
| `npm run dev`    | Start dev server        |
| `npm run build`  | Production build        |
| `npm run preview`| Preview production build|
| `npm run lint`   | Run ESLint              |

## Environment

| Variable        | Description                        | Default            |
|-----------------|------------------------------------|--------------------|
| `VITE_API_URL`  | Backend API base URL               | `http://localhost:4000` |

## Routes

| Path             | Description                     |
|------------------|---------------------------------|
| `/`              | Main invite page (no token)     |
| `/invite/:token` | Invite page with guest token    |

## Build (production)

From the **repo root**, `.\release.ps1` builds with `VITE_API_URL=https://api.francoisandkaitlyn.co.za` and zips `dist/` into the release package.

Manual build:

```powershell
$env:VITE_API_URL="https://api.francoisandkaitlyn.co.za"; npm run build
```

Output is `dist/`. `public/_redirects` helps Netlify SPA routing; nginx should serve `try_files` for the SPA.
