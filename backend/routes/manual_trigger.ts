import { Router } from "express";
import { fullSync } from "../sync/fullSync";

const router = Router();

// POST /api → manual trigger
router.post("/", async (req, res) => {
  try {
    fullSync();
    res.json({ message: "Sheets sync triggered (queued)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sync failed", error: err });
  }
});

export default router;
