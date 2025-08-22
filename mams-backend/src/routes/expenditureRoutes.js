import express from "express";
import {
  createExpenditure,
  getExpenditures,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
  getAvailableItemsForExpenditureEndpoint,
  getUniqueItemsForFilter,
} from "../controllers/expenditureController.js";
import { authenticate } from "../middleware/auth.js";
import { permit } from "../middleware/rbac.js";

const router = express.Router();

router.get("/", authenticate, permit("admin", "logistics", "base_commander"), getExpenditures);
router.get("/items/available", authenticate, permit("admin", "logistics", "base_commander"), getAvailableItemsForExpenditureEndpoint);
router.get("/items/filter", authenticate, permit("admin", "logistics", "base_commander"), getUniqueItemsForFilter);
router.get("/:id", authenticate, permit("admin", "logistics", "base_commander"), getExpenditureById);
router.post("/", authenticate, permit("admin", "base_commander"), createExpenditure);
router.put("/:id", authenticate, permit("admin", "base_commander"), updateExpenditure);
router.delete("/:id", authenticate, permit("admin"), deleteExpenditure);

export default router;
