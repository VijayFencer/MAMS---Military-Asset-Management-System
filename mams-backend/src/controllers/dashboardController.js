import { Op } from "sequelize";
import { computeAvailable } from "../utils/inventory.js";

export async function summary(req, res) {
  try {
    const { baseId: qBase, item, startDate, endDate } = req.query;
    const toDate = endDate || new Date().toISOString().slice(0, 10);
    const fromDate = startDate || "1900-01-01";

    const baseId = req.user.role === "admin" ? (qBase ? Number(qBase) : null) : req.user.baseId;

    const close = await computeAvailable(item || null, baseId, toDate);

    const dayBeforeFrom = new Date(new Date(fromDate).getTime() - 86400000)
      .toISOString()
      .slice(0, 10);
    const open = await computeAvailable(item || null, baseId, dayBeforeFrom);

    const purchases = (close.purchasesQty || 0) - (open.purchasesQty || 0);
    const transferIn = (close.transfersInQty || 0) - (open.transfersInQty || 0);
    const transferOut = (close.transfersOutQty || 0) - (open.transfersOutQty || 0);
    const assigned = (close.assignedQty || 0) - (open.assignedQty || 0);
    const expended = (close.expendedQty || 0) - (open.expendedQty || 0);

    return res.json({
      opening: open.available || 0,
      purchases,
      transferIn,
      transferOut,
      assigned,
      expended,
      closing: close.available || 0,
      netMovement: purchases + transferIn - transferOut,
    });
  } catch (e) {
    console.error("Dashboard summary error:", e);
    res.status(500).json({ error: "Failed to compute summary" });
  }
}

export async function netMovement(req, res) {
  res.json({ purchases: [], transfersIn: [], transfersOut: [] });
}