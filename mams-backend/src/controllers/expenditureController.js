// controllers/expenditureController.js
import { Expenditure } from "../models/Expenditure.js";
import { AuditLog } from "../models/AuditLog.js";
import { sequelize } from "../config/db.js";
import { computeAvailable, getAvailableItemsForExpenditure } from "../utils/inventory.js";
import { Op } from "sequelize";

export const createExpenditure = async (req, res) => {
  const { item, quantity, baseLocation, reason, date } = req.body;
  const t = await sequelize.transaction();
  try {
    if (!item || !quantity || !baseLocation) {
      await t.rollback();
      return res.status(400).json({ error: "item, quantity and baseLocation are required" });
    }

    // RBAC: non-admins must spend from their own base only
    if (req.user?.role !== "admin") {
      if (!req.user?.baseId) { await t.rollback(); return res.status(403).json({ error: "Forbidden: no base assignment" }); }
      // computeAvailable accepts baseLocation names as well; ensure it matches user's base
      // If you migrate to base_id in Expenditures, map id->name here
    }

    // check available
    const { available } = await computeAvailable(item, baseLocation, date || null, { transaction: t });
    if (available < quantity) {
      await t.rollback();
      return res.status(400).json({ error: "Insufficient stock at base" });
    }

    const expenditure = await Expenditure.create({
      item,
      quantity,
      baseLocation,
      reason: reason || null,
      date: date || new Date().toISOString().split("T")[0],
    }, { transaction: t });

    await AuditLog.create({
      userId: req.user?.userId || req.user?.id || null,
      action: "CREATE_EXPENDITURE",
      resource: "expenditure",
      resourceId: expenditure.id.toString(),
      payload: req.body,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    }, { transaction: t });

    await t.commit();
    res.status(201).json(expenditure);
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getExpenditures = async (req, res) => {
  try {
    const { baseLocation, item, start, end } = req.query;
    const where = {};
    if (baseLocation) where.baseLocation = baseLocation;
    if (item) where.item = item;
    if (start && end) where.date = { [Op.between]: [start, end] };
    else if (start) where.date = { [Op.gte]: start };
    else if (end) where.date = { [Op.lte]: end };
    if (req.user?.role !== "admin" && req.user?.baseId) {
      // filter to their base by name if possible (if you switch to base_id, map id->where)
    }
    const exps = await Expenditure.findAll({ where, order: [["date", "DESC"]] });
    res.json(exps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExpenditureById = async (req, res) => {
  try {
    const ex = await Expenditure.findByPk(req.params.id);
    if (!ex) return res.status(404).json({ error: "Expenditure not found" });
    res.json(ex);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateExpenditure = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const ex = await Expenditure.findByPk(req.params.id, { transaction: t });
    if (!ex) { await t.rollback(); return res.status(404).json({ error: "Expenditure not found" }); }

    // If updating quantity, ensure not making negative stock (complex) - for now prevent increase beyond available + current quantity
    if (req.body.quantity && req.body.quantity !== ex.quantity) {
      const { available } = await computeAvailable(ex.item, ex.baseLocation, ex.date, { transaction: t });
      const netAvailable = available + ex.quantity;
      if (req.body.quantity > netAvailable) {
        await t.rollback();
        return res.status(400).json({ error: "Insufficient stock for requested quantity change" });
      }
    }

    await ex.update(req.body, { transaction: t });

    await AuditLog.create({
      userId: req.user?.userId || req.user?.id || null,
      action: "UPDATE_EXPENDITURE",
      resource: "expenditure",
      resourceId: ex.id.toString(),
      payload: req.body,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    }, { transaction: t });

    await t.commit();
    res.json(ex);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

export const deleteExpenditure = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const ex = await Expenditure.findByPk(req.params.id, { transaction: t });
    if (!ex) { await t.rollback(); return res.status(404).json({ error: "Expenditure not found" }); }
    await ex.destroy({ transaction: t });

    await AuditLog.create({
      userId: req.user?.userId || req.user?.id || null,
      action: "DELETE_EXPENDITURE",
      resource: "expenditure",
      resourceId: ex.id.toString(),
      payload: { id: ex.id },
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    }, { transaction: t });

    await t.commit();
    res.json({ message: "Expenditure deleted" });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

// Get available items for expenditure
export const getAvailableItemsForExpenditureEndpoint = async (req, res) => {
  try {
    const { baseLocation } = req.query;
    
    if (!baseLocation) {
      return res.status(400).json({ error: "baseLocation is required" });
    }

    const items = await getAvailableItemsForExpenditure(baseLocation);

    res.json(items);
  } catch (err) {
    console.error("Get available items for expenditure error:", err);
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

    const items = await Expenditure.findAll({
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
