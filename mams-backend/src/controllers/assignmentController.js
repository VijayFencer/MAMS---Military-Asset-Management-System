// controllers/assignmentController.js
import { Assignment } from "../models/Assignment.js";
import { Base } from "../models/Base.js";
import { AuditLog } from "../models/AuditLog.js";
import { sequelize } from "../config/db.js";
import { computeAvailable, getAvailableItemsForAssignment, getPersonnelList } from "../utils/inventory.js";
import { Op } from "sequelize";

export const createAssignment = async (req, res) => {
  const { item, quantity, baseLocation, personnel, dateAssigned } = req.body;

  const t = await sequelize.transaction();
  try {
    // validate
    if (!item || !quantity || !baseLocation || !personnel) {
      await t.rollback();
      return res.status(400).json({ error: "item, quantity, baseLocation and personnel are required" });
    }

    // RBAC: non-admin users restricted to their base
    if (req.user?.role !== "admin") {
      if (!req.user?.baseId) { await t.rollback(); return res.status(403).json({ error: "Forbidden: no base assignment" }); }
      const b = await Base.findByPk(Number(req.user.baseId));
      if (!b) { await t.rollback(); return res.status(400).json({ error: "Invalid user base" }); }
      if (String(baseLocation) !== b.name) {
        await t.rollback();
        return res.status(403).json({ error: "Forbidden: cannot create assignment for another base" });
      }
    }

    // check available using transaction to avoid race
    const { available } = await computeAvailable(item, baseLocation, dateAssigned || null, { transaction: t });
    if (available < quantity) {
      await t.rollback();
      return res.status(400).json({ error: "Insufficient stock at base" });
    }

    const assignment = await Assignment.create({
      item,
      quantity,
      baseLocation,
      personnel,
      dateAssigned: dateAssigned || new Date().toISOString().split("T")[0],
      status: "assigned",
    }, { transaction: t });

    // Audit log
    await AuditLog.create({
      userId: req.user?.userId || req.user?.id || null,
      action: "CREATE_ASSIGNMENT",
      resource: "assignment",
      resourceId: assignment.id.toString(),
      payload: req.body,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    }, { transaction: t });

    await t.commit();
    res.status(201).json(assignment);
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { baseLocation, item, start, end } = req.query;
    const where = {};
    if (baseLocation) where.baseLocation = baseLocation;
    if (item) where.item = item;
    if (start && end) where.dateAssigned = { [Op.between]: [start, end] };
    else if (start) where.dateAssigned = { [Op.gte]: start };
    else if (end) where.dateAssigned = { [Op.lte]: end };

    // RBAC: non-admins can only see their base
    if (req.user?.role !== "admin") {
      if (req.user?.baseId) {
        const b = await Base.findByPk(Number(req.user.baseId));
        if (b) where.baseLocation = b.name;
      }
    }

    const assignments = await Assignment.findAll({ where, order: [["dateAssigned", "DESC"]] });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const a = await Assignment.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: "Assignment not found" });
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAssignment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const assignment = await Assignment.findByPk(req.params.id, { transaction: t });
    if (!assignment) { await t.rollback(); return res.status(404).json({ error: "Assignment not found" }); }

    // RBAC: non-admins cannot move assignment to other base
    if (req.user?.role !== "admin") {
      if (!req.user?.baseId) { await t.rollback(); return res.status(403).json({ error: "Forbidden: no base assignment" }); }
      const b = await Base.findByPk(Number(req.user.baseId));
      if (!b) { await t.rollback(); return res.status(400).json({ error: "Invalid user base" }); }
      const nextBaseLocation = req.body.baseLocation ?? assignment.baseLocation;
      if (nextBaseLocation !== b.name) {
        await t.rollback();
        return res.status(403).json({ error: "Forbidden: cannot change assignment to another base" });
      }
    }

    const updates = req.body;
    // If changing quantity or status we may need to validate availability (when increasing)
    if (updates.quantity && updates.quantity !== assignment.quantity) {
      // compute available excluding current assignment (pretend we remove old quantity)
      const { available } = await computeAvailable(assignment.item, assignment.baseLocation, assignment.dateAssigned, { transaction: t });
      const netAvailable = available + assignment.quantity; // because assignment.quantity is currently already subtracted
      if (updates.quantity > netAvailable) {
        await t.rollback();
        return res.status(400).json({ error: "Insufficient stock for requested quantity change" });
      }
    }

    await assignment.update(updates, { transaction: t });

    await AuditLog.create({
      userId: req.user?.userId || req.user?.id || null,
      action: "UPDATE_ASSIGNMENT",
      resource: "assignment",
      resourceId: assignment.id.toString(),
      payload: updates,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    }, { transaction: t });

    await t.commit();
    res.json(assignment);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

export const deleteAssignment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const assignment = await Assignment.findByPk(req.params.id, { transaction: t });
    if (!assignment) { await t.rollback(); return res.status(404).json({ error: "Assignment not found" }); }
    await assignment.destroy({ transaction: t });

    await AuditLog.create({
      userId: req.user?.userId || req.user?.id || null,
      action: "DELETE_ASSIGNMENT",
      resource: "assignment",
      resourceId: assignment.id.toString(),
      payload: { id: assignment.id },
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    }, { transaction: t });

    await t.commit();
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

// Get unique item names for filter select boxes
export const getUniqueItemsForFilter = async (req, res) => {
  try {
    const { baseLocation } = req.query;
    
    let where = {};
    if (baseLocation) {
      where.baseLocation = baseLocation;
    }

    const items = await Assignment.findAll({
      where,
      attributes: ['item'],
      group: ['item'],
      order: [['item', 'ASC']]
    });

    const uniqueItems = items.map(item => item.item);
    res.json(uniqueItems);
  } catch (err) {
    console.error("Get unique items for filter error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get available items for assignment
export const getAvailableItemsForAssignmentEndpoint = async (req, res) => {
  try {
    const { baseLocation } = req.query;
    
    if (!baseLocation) {
      return res.status(400).json({ error: "baseLocation is required" });
    }

    const items = await getAvailableItemsForAssignment(baseLocation);

    res.json(items);
  } catch (err) {
    console.error("Get available items for assignment error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get personnel list for assignment
export const getPersonnelForAssignment = async (req, res) => {
  try {
    const { baseLocation } = req.query;
    
    if (!baseLocation) {
      return res.status(400).json({ error: "baseLocation is required" });
    }

    const personnel = await getPersonnelList(baseLocation);

    res.json(personnel);
  } catch (err) {
    console.error("Get personnel for assignment error:", err);
    res.status(500).json({ error: err.message });
  }
};
