import express from "express";
import {
  createTransfer,
  getTransfers,
  getTransferById,
  updateTransfer,
  deleteTransfer,
  getAvailableItemsForTransferEndpoint,
  getCurrentStockForTransfer,
  getUniqueItemsForFilter,
} from "../controllers/transferController.js";
import { authenticate } from "../middleware/auth.js";
import { permit } from "../middleware/rbac.js";

const router = express.Router();

router.get("/", authenticate, permit("admin", "logistics", "base_commander"), getTransfers);
router.get("/items/available", authenticate, permit("admin", "logistics", "base_commander"), getAvailableItemsForTransferEndpoint);
router.get("/items/filter", authenticate, permit("admin", "logistics", "base_commander"), getUniqueItemsForFilter);
router.get("/stock/current", authenticate, permit("admin", "logistics", "base_commander"), getCurrentStockForTransfer);
router.get("/:id", authenticate, permit("admin", "logistics", "base_commander"), getTransferById);
router.post("/", authenticate, permit("admin", "base_commander"), createTransfer);
router.put("/:id", authenticate, permit("admin", "base_commander"), updateTransfer);
router.delete("/:id", authenticate, permit("admin"), deleteTransfer);

export default router;
