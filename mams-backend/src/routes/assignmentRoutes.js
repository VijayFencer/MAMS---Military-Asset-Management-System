import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getAvailableItemsForAssignmentEndpoint,
  getPersonnelForAssignment,
  getUniqueItemsForFilter,
} from "../controllers/assignmentController.js";
import { authenticate } from "../middleware/auth.js";
import { permit } from "../middleware/rbac.js";

const router = express.Router();

router.get("/", authenticate, permit("admin", "logistics", "base_commander"), getAssignments);
router.get("/items/available", authenticate, permit("admin", "logistics", "base_commander"), getAvailableItemsForAssignmentEndpoint);
router.get("/items/filter", authenticate, permit("admin", "logistics", "base_commander"), getUniqueItemsForFilter);
router.get("/personnel/list", authenticate, permit("admin", "logistics", "base_commander"), getPersonnelForAssignment);
router.get("/:id", authenticate, permit("admin", "logistics", "base_commander"), getAssignmentById);
router.post("/", authenticate, permit("admin", "base_commander"), createAssignment);
router.put("/:id", authenticate, permit("admin", "base_commander"), updateAssignment);
router.delete("/:id", authenticate, permit("admin"), deleteAssignment);

export default router;
