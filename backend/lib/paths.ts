import path from "path";

/**
 * Data and credentials live next to package.json.
 * Start the server from the `backend` directory (`npm start`, `npm run dev`).
 */
export function dataFile(...segments: string[]): string {
  return path.join(process.cwd(), "data", ...segments);
}

export function credentialsFile(...segments: string[]): string {
  return path.join(process.cwd(), "credentials", ...segments);
}
