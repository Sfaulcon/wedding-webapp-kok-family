/** PM2 — run from the `api` folder after `npm ci --omit=dev` */
module.exports = {
  apps: [
    {
      name: "wedding-api",
      cwd: __dirname,
      script: "dist/index.js",
      env: { NODE_ENV: "production" },
    },
  ],
};
