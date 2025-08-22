import { Router } from "express";
import { summary, netMovement } from "../controllers/dashboardController.js";
import { permit } from "../middleware/rbac.js";

const router = Router();
router.get("/summary", permit("admin", "base_commander", "logistics"), summary);
router.get("/net-movement", permit("admin", "base_commander", "logistics"), netMovement);
export default router;
