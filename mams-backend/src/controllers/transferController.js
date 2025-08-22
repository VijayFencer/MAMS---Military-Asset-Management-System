// controllers/transferController.js
import { Transfer } from "../models/Transfer.js";
import { AuditLog } from "../models/AuditLog.js";
import { sequelize } from "../config/db.js";
import { computeAvailable, getAvailableItemsForTransfer, getCurrentStock, getAvailableItems } from "../utils/inventory.js";
import { Base } from "../models/Base.js";
import { Op } from "sequelize";
import { auditMiddleware } from "../middleware/audit.js";

// Create transfer with real-time stock validation
export const createTransfer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { item, quantity, date, from_base, to_base } = req.body;
    
    // Support both old and new field names
    let srcBaseId = req.body.sourceBaseId || req.body.source_base_id;
    let dstBaseId = req.body.destinationBaseId || req.body.destination_base_id;
    
    // If using new field names (from_base, to_base), convert to base IDs
    if (from_base && to_base) {
      const sourceBase = await Base.findOne({ where: { name: from_base } });
      const destBase = await Base.findOne({ where: { name: to_base } });
      
      if (!sourceBase || !destBase) {
        await t.rollback();
        return res.status(400).json({ error: "Invalid base names provided" });
      }
      
      srcBaseId = sourceBase.id;
      dstBaseId = destBase.id;
    }
    
    if (!srcBaseId || !dstBaseId || !item || !quantity) {
      await t.rollback();
      return res.status(400).json({ error: "sourceBaseId, destinationBaseId, item, quantity are required" });
    }

    // Validate quantity is positive
    if (Number(quantity) <= 0) {
      await t.rollback();
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    // RBAC: non-admins can only transfer from their own base
    if (req.user?.role !== "admin") {
      if (!req.user?.baseId) { 
        await t.rollback(); 
        return res.status(403).json({ error: "Forbidden: no base assignment" }); 
      }
      srcBaseId = Number(req.user.baseId);
    }

    const sourceBase = await Base.findByPk(Number(srcBaseId));
    const destinationBase = await Base.findByPk(Number(dstBaseId));
    if (!sourceBase || !destinationBase) {
      await t.rollback();
      return res.status(400).json({ error: "Invalid base id(s)" });
    }

    // Prevent self-transfer
    if (sourceBase.id === destinationBase.id) {
      await t.rollback();
      return res.status(400).json({ error: "Cannot transfer to the same base" });
    }

    // REAL-TIME STOCK VALIDATION: Check available stock at source base
    const { available } = await computeAvailable(item, Number(sourceBase.id), date || null, { transaction: t });
    
    if (available < Number(quantity)) {
      await t.rollback();
      return res.status(400).json({ 
        error: "Insufficient stock for transfer", 
        details: {
          requested: Number(quantity),
          available: available,
          item: item,
          sourceBase: sourceBase.name
        }
      });
    }

    // Create transfer record (without status field for now)
    const transferData = {
      sourceLocation: sourceBase.name,
      destinationLocation: destinationBase.name,
      item,
      quantity: Number(quantity),
      date: date || new Date().toISOString().slice(0, 10),
      source_base_id: sourceBase.id,
      destination_base_id: destinationBase.id
    };

    const transfer = await Transfer.create(transferData, { transaction: t });

    // Log the transfer action for audit trail
    await auditMiddleware.logAction(req, "CREATE_TRANSFER", "transfer", transfer.id, {
      ...req.body,
      beforeStock: available,
      afterStock: available - Number(quantity),
      sourceBase: sourceBase.name,
      destinationBase: destinationBase.name
    });

    await t.commit();
    
    // Return transfer with stock information
    res.status(201).json({
      ...transfer.toJSON(),
      stockInfo: {
        beforeTransfer: available,
        afterTransfer: available - Number(quantity),
        transferred: Number(quantity)
      }
    });
  } catch (err) {
    await t.rollback();
    console.error("Transfer creation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all transfers with enhanced filtering
export const getTransfers = async (req, res) => {
  try {
    let where = {};
    
    // Role-based filtering
    if (req.user?.role !== "admin" && req.user?.baseId) {
      where = {
        ...(where || {}),
        [Op.or]: [
          { source_base_id: Number(req.user.baseId) },
          { destination_base_id: Number(req.user.baseId) },
        ],
      };
    } else if (req.user?.role === "admin" && req.query.baseId) {
      // Admin can filter by specific base
      const baseId = Number(req.query.baseId);
      where = {
        ...(where || {}),
        [Op.or]: [
          { source_base_id: baseId },
          { destination_base_id: baseId },
        ],
      };
    }

    // Add date range filter if provided
    if (req.query.startDate && req.query.endDate) {
      where.date = {
        [Op.between]: [req.query.startDate, req.query.endDate]
      };
    }

    // Add item filter if provided
    if (req.query.item) {
      where.item = req.query.item;
    }

    const transfers = await Transfer.findAll({ 
      where,
      order: [['created_at', 'DESC']]
    });
    
    res.json(transfers);
  } catch (err) {
    console.error("Get transfers error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single transfer
export const getTransferById = async (req, res) => {
  try {
    const transfer = await Transfer.findByPk(req.params.id);
    if (!transfer) return res.status(404).json({ error: "Transfer not found" });
    
    // Role-based access control
    if (req.user?.role !== "admin" && req.user?.baseId) {
      const bId = Number(req.user.baseId);
      if (transfer.source_base_id !== bId && transfer.destination_base_id !== bId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    
    res.json(transfer);
  } catch (err) {
    console.error("Get transfer by ID error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update transfer with enhanced validation
export const updateTransfer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const transfer = await Transfer.findByPk(req.params.id, { transaction: t });
    if (!transfer) { 
      await t.rollback(); 
      return res.status(404).json({ error: "Transfer not found" }); 
    }

    // If changing source/item/quantity/date, validate availability
    const next = { ...transfer.toJSON(), ...req.body };
    if (
      next.sourceLocation !== transfer.sourceLocation ||
      next.item !== transfer.item ||
      next.quantity !== transfer.quantity ||
      next.date !== transfer.date
    ) {
      // when updating, prefer base ids if provided
      const baseSelector = next.source_base_id || transfer.source_base_id || next.sourceLocation;
      const { available } = await computeAvailable(next.item, baseSelector, next.date || null, { transaction: t });
      // Add back previous transfer quantity to available
      const netAvailable = available + Number(transfer.quantity);
      if (Number(next.quantity) > netAvailable) {
        await t.rollback();
        return res.status(400).json({ 
          error: "Insufficient stock at source base for update",
          details: {
            requested: Number(next.quantity),
            available: netAvailable,
            currentTransfer: Number(transfer.quantity)
          }
        });
      }
    }

    // Normalize names and ids if ids are provided in update
    const updates = { ...req.body };
    if (updates.sourceBaseId || updates.source_base_id) {
      const b = await Base.findByPk(Number(updates.sourceBaseId || updates.source_base_id));
      if (!b) { 
        await t.rollback(); 
        return res.status(400).json({ error: "Invalid source base id" }); 
      }
      updates.source_base_id = b.id;
      updates.sourceLocation = b.name;
    }
    if (updates.destinationBaseId || updates.destination_base_id) {
      const b = await Base.findByPk(Number(updates.destinationBaseId || updates.destination_base_id));
      if (!b) { 
        await t.rollback(); 
        return res.status(400).json({ error: "Invalid destination base id" }); 
      }
      updates.destination_base_id = b.id;
      updates.destinationLocation = b.name;
    }

    await transfer.update(updates, { transaction: t });
    await auditMiddleware.logAction(req, "UPDATE_TRANSFER", "transfer", transfer.id, req.body);
    await t.commit();
    res.json(transfer);
  } catch (err) {
    await t.rollback();
    console.error("Update transfer error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete transfer with enhanced validation
export const deleteTransfer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const transfer = await Transfer.findByPk(req.params.id, { transaction: t });
    if (!transfer) { 
      await t.rollback();
      return res.status(404).json({ error: "Transfer not found" }); 
    }

    await transfer.destroy({ transaction: t });
    await auditMiddleware.logAction(req, "DELETE_TRANSFER", "transfer", transfer.id, {});
    await t.commit();
    res.json({ message: "Transfer deleted successfully" });
  } catch (err) {
    await t.rollback();
    console.error("Delete transfer error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get unique item names for filter select boxes
export const getUniqueItemsForFilter = async (req, res) => {
  try {
    const items = await Transfer.findAll({
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

// Get available items for transfer
export const getAvailableItemsForTransferEndpoint = async (req, res) => {
  try {
    const { baseId } = req.query;
    
    if (!baseId) {
      return res.status(400).json({ error: "baseId is required" });
    }

    const items = await getAvailableItemsForTransfer(Number(baseId));
    res.json(items);
  } catch (err) {
    console.error("Get available items for transfer error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get current stock levels for transfer validation
export const getCurrentStockForTransfer = async (req, res) => {
  try {
    const { baseId, item } = req.query;
    
    if (!baseId || !item) {
      return res.status(400).json({ error: "baseId and item are required" });
    }

    const stockInfo = await getCurrentStock(baseId, item);
    res.json(stockInfo);
  } catch (err) {
    console.error("Get current stock for transfer error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get available items from a base
export const getAvailableItemsFromBase = async (req, res) => {
  try {
    const { baseId } = req.query;
    
    if (!baseId) {
      return res.status(400).json({ error: "baseId is required" });
    }

    const items = await getAvailableItems(Number(baseId));

    res.json(items);
  } catch (err) {
    console.error("Get available items error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get transfer statistics
export const getTransferStats = async (req, res) => {
  try {
    const { baseId, startDate, endDate } = req.query;
    let where = {};
    
    // Filter by base if provided
    if (baseId) {
      where = {
        [Op.or]: [
          { source_base_id: Number(baseId) },
          { destination_base_id: Number(baseId) }
        ]
      };
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const transfers = await Transfer.findAll({ where });
    
    const stats = {
      totalTransfers: transfers.length,
      totalQuantity: transfers.reduce((sum, t) => sum + Number(t.quantity), 0),
      byItem: {},
      byBase: {}
    };

    transfers.forEach(transfer => {
      // Count by item
      stats.byItem[transfer.item] = (stats.byItem[transfer.item] || 0) + Number(transfer.quantity);
      
      // Count by base
      stats.byBase[transfer.sourceLocation] = (stats.byBase[transfer.sourceLocation] || 0) + Number(transfer.quantity);
      stats.byBase[transfer.destinationLocation] = (stats.byBase[transfer.destinationLocation] || 0) - Number(transfer.quantity);
    });

    res.json(stats);
  } catch (err) {
    console.error("Get transfer stats error:", err);
    res.status(500).json({ error: err.message });
  }
};
