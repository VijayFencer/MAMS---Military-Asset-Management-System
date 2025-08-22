import { Purchase } from "../models/Purchase.js";
import { Base } from "../models/Base.js";
import { Op } from "sequelize";
import { auditMiddleware } from "../middleware/audit.js";
import { computeAvailable } from "../utils/inventory.js";

export async function createPurchase(req, res) {
  try {
    const { item, quantity, price, date } = req.body;
    const bodyBaseId = req.body.baseId || req.body.base_id || null;

    if (!item || !quantity || !price) {
      return res.status(400).json({ error: "item, quantity, price are required" });
    }
    
    const qtyNum = Number(quantity);
    const priceNum = Number(price);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ error: "quantity must be a positive number" });
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: "price must be a non-negative number" });
    }

    const payload = { item, quantity: qtyNum, price: priceNum };

    let resolvedBaseId = null;
    if (req.user?.role !== "admin") {
      if (!req.user?.baseId) return res.status(403).json({ error: "Forbidden: no base assignment" });
      resolvedBaseId = Number(req.user.baseId);
    } else {
      if (!bodyBaseId) return res.status(400).json({ error: "baseId is required" });
      resolvedBaseId = Number(bodyBaseId);
    }

    const base = await Base.findByPk(Number(resolvedBaseId));
    if (!base) return res.status(400).json({ error: "Invalid baseId" });
    payload.base_id = base.id;
    payload.location = base.name;
    if (date) payload.date = date;

    const created = await Purchase.create(payload);
    await auditMiddleware.logAction(req, "CREATE", "purchase", created.id, created);
    return res.status(201).json(created);
  } catch (err) {
    console.error("createPurchase error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/purchases
export async function listPurchases(req, res) {
  try {
    // optional query params: ?startDate=yyyy-mm-dd&endDate=yyyy-mm-dd&item=&baseId=&location=
    const { startDate, endDate, start, end, item, baseId, location } = req.query;

    const where = {};
    if (item) where.item = item;
    
    // Support both old (start/end) and new (startDate/endDate) parameter names
    const startDateParam = startDate || start;
    const endDateParam = endDate || end;
    
    if (startDateParam || endDateParam) {
      where.date = {};
      if (startDateParam) where.date[Op.gte] = startDateParam;
      if (endDateParam) where.date[Op.lte] = endDateParam;
    }
    
    // RBAC scoping: non-admins restricted to their base
    if (req.user?.role !== "admin") {
      if (req.user?.baseId) where.base_id = req.user.baseId;
    } else {
      if (baseId) where.base_id = Number(baseId);
    }
    
    if (location) where.location = location;

    const purchases = await Purchase.findAll({ 
      where, 
      order: [["date", "DESC"]],
      include: [
        {
          model: Base,
          as: 'base',
          attributes: ['id', 'name']
        }
      ]
    });
    
    return res.json(purchases);
  } catch (err) {
    console.error("listPurchases error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPurchaseById(req, res) {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findByPk(id);
    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }
    return res.json(purchase);
  } catch (err) {
    console.error("getPurchaseById error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// PUT /api/purchases/:id
export async function updatePurchase(req, res) {
  try {
    const id = Number(req.params.id);
    const { item, quantity, price, date, location } = req.body;
    if (!id) return res.status(400).json({ error: "Invalid purchase ID" });

    const payload = {};
    if (item !== undefined) payload.item = item;
    if (location !== undefined) payload.location = location; // Added location support
    if (quantity !== undefined) {
      const q = Number(quantity);
      if (!Number.isFinite(q) || q <= 0) {
        return res.status(400).json({ error: "quantity must be a positive number" });
      }
      payload.quantity = q;
    }
    if (price !== undefined) {
      const p = Number(price);
      if (!Number.isFinite(p) || p < 0) {
        return res.status(400).json({ error: "price must be a non-negative number" });
      }
      payload.price = p;
    }
    if (date !== undefined) {
      payload.date = date;
    }

    const [affected] = await Purchase.update(payload, { where: { id } });
    if (affected === 0) return res.status(404).json({ error: "Purchase not found" });

    const updated = await Purchase.findByPk(id);
    await auditMiddleware.logAction(req, "UPDATE", "purchase", id, updated);
    return res.json(updated);
  } catch (err) {
    console.error("updatePurchase error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /api/purchases/:id
export async function deletePurchase(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Purchase.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Purchase not found" });
    await auditMiddleware.logAction(req, "DELETE", "purchase", id, { id });
    return res.json({ message: "Purchase deleted" });
  } catch (err) {
    console.error("deletePurchase error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get unique item names for filter select boxes
export async function getUniqueItemsForFilter(req, res) {
  try {
    const { baseId } = req.query;
    
    let where = {};
    if (baseId) {
      where.base_id = Number(baseId);
    }

    const items = await Purchase.findAll({
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
}

// GET /api/purchases/stats  -> { count, totalAmount }
export async function purchaseStats(_req, res) {
  try {
    const rows = await Purchase.findAll({ attributes: ["quantity", "price"] });
    const count = rows.length;
    const totalAmount = rows.reduce((sum, r) => sum + Number(r.quantity) * Number(r.price), 0);
    return res.json({ count, totalAmount });
  } catch (err) {
    console.error("purchaseStats error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


