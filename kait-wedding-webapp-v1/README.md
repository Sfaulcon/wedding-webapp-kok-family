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

## Build

```bash
npm run build
```

Output goes to `dist/`. Point your static hosting at this folder.
