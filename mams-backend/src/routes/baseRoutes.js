import express from "express";
import { Base } from "../models/Base.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const bases = await Base.findAll({ order: [["name", "ASC"]] });
    res.json(bases.map(b => ({ id: b.id, name: b.name, code: b.code, location: b.location })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


