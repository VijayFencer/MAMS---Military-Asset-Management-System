import express from "express";
import {
  createPurchase,
  listPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
  getUniqueItemsForFilter,
} from "../controllers/purchaseController.js";
import { authenticate } from "../middleware/auth.js";
import { permit } from "../middleware/rbac.js";

const router = express.Router();

router.get("/", authenticate, permit("admin", "logistics", "base_commander"), listPurchases);
router.get("/items/filter", authenticate, permit("admin", "logistics", "base_commander"), getUniqueItemsForFilter);
router.get("/:id", authenticate, permit("admin", "logistics", "base_commander"), getPurchaseById);
router.post("/", authenticate, permit("admin", "base_commander"), createPurchase);
router.put("/:id", authenticate, permit("admin", "base_commander"), updatePurchase);
router.delete("/:id", authenticate, permit("admin"), deletePurchase);

export default router;
