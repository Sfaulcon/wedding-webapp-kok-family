import { Router } from "express";
import { loadWebsiteInfo } from "../lib/websiteInfo";

const router = Router();

// GET /api/website-info - public, no auth. Returns dress code, gifts, food options, story, banking.
router.get("/", async (_req, res) => {
  try {
    const info = await loadWebsiteInfo();
    res.json(info);
  } catch (err) {
    res.status(500).json({ message: "Failed to load website info" });
  }
});

export default router;
