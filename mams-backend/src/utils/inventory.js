import { Op } from "sequelize";
import { Purchase } from "../models/Purchase.js";
import { Transfer } from "../models/Transfer.js";
import { Assignment } from "../models/Assignment.js";
import { Expenditure } from "../models/Expenditure.js";

export const computeAvailable = async (item, baseSelector, uptoDate = null, options = {}) => {
  const dateCond = uptoDate
    ? { [Op.lte]: uptoDate }
    : { [Op.lte]: new Date().toISOString().slice(0, 10) };

  const itemCond = item ? { item } : {};
  const hasBase = baseSelector !== null && baseSelector !== undefined && baseSelector !== "";
  const isNumericBase = hasBase && typeof baseSelector === "number" && Number.isFinite(baseSelector);

  const purchasesWhere = hasBase
    ? (isNumericBase
        ? { ...itemCond, base_id: baseSelector, date: dateCond }
        : { ...itemCond, location: baseSelector, date: dateCond })
    : { ...itemCond, date: dateCond };
  const purchasesQty = (await Purchase.sum("quantity", { where: purchasesWhere, ...options })) || 0;

  const transfersInWhere = hasBase
    ? (isNumericBase
        ? { ...itemCond, destination_base_id: baseSelector, date: dateCond }
        : { ...itemCond, destinationLocation: baseSelector, date: dateCond })
    : { ...itemCond, date: dateCond };
  const transfersInQty = (await Transfer.sum("quantity", { where: transfersInWhere, ...options })) || 0;

  const transfersOutWhere = hasBase
    ? (isNumericBase
        ? { ...itemCond, source_base_id: baseSelector, date: dateCond }
        : { ...itemCond, sourceLocation: baseSelector, date: dateCond })
    : { ...itemCond, date: dateCond };
  const transfersOutQty = (await Transfer.sum("quantity", { where: transfersOutWhere, ...options })) || 0;

  const assignedWhere = hasBase
    ? (isNumericBase
        ? { ...itemCond, base_id: baseSelector, dateAssigned: dateCond }
        : { ...itemCond, baseLocation: baseSelector, dateAssigned: dateCond })
    : { ...itemCond, dateAssigned: dateCond };
  const assignedQty = (await Assignment.sum("quantity", { where: assignedWhere, ...options })) || 0;

  const expendedWhere = hasBase
    ? (isNumericBase
        ? { ...itemCond, base_id: baseSelector, date: dateCond }
        : { ...itemCond, baseLocation: baseSelector, date: dateCond })
    : { ...itemCond, date: dateCond };
  const expendedQty = (await Expenditure.sum("quantity", { where: expendedWhere, ...options })) || 0;

  const available = purchasesQty + transfersInQty - transfersOutQty - assignedQty - expendedQty;
  return { available, purchasesQty, transfersInQty, transfersOutQty, assignedQty, expendedQty };
};

export const getAvailableItems = async (baseSelector, options = {}) => {
  const hasBase = baseSelector !== null && baseSelector !== undefined && baseSelector !== "";
  const isNumericBase = hasBase && typeof baseSelector === "number" && Number.isFinite(baseSelector);

  if (!hasBase) return [];

  let purchasesWhere;
  if (isNumericBase) {
    purchasesWhere = {
      [Op.or]: [
        { base_id: baseSelector },
        { location: baseSelector }
      ]
    };
  } else {
    purchasesWhere = { location: baseSelector };
  }
  
  const purchasedItems = await Purchase.findAll({
    where: purchasesWhere,
    attributes: ['item'],
    group: ['item'],
    ...options
  });

  const items = [];
  
  for (const purchase of purchasedItems) {
    const { available } = await computeAvailable(purchase.item, baseSelector, null, options);
    if (available > 0) {
      items.push({
        item: purchase.item,
        available: available
      });
    }
  }

  const transfersInWhere = isNumericBase
    ? { destination_base_id: baseSelector }
    : { destinationLocation: baseSelector };
  
  const transferredItems = await Transfer.findAll({
    where: transfersInWhere,
    attributes: ['item'],
    group: ['item'],
    ...options
  });

  for (const transfer of transferredItems) {
    const existingItem = items.find(i => i.item === transfer.item);
    if (!existingItem) {
      const { available } = await computeAvailable(transfer.item, baseSelector, null, options);
      if (available > 0) {
        items.push({
          item: transfer.item,
          available: available
        });
      }
    }
  }

  return items.sort((a, b) => a.item.localeCompare(b.item));
};

export const getAvailableItemsForAssignment = async (baseSelector, options = {}) => {
  const hasBase = baseSelector !== null && baseSelector !== undefined && baseSelector !== "";
  const isNumericBase = hasBase && typeof baseSelector === "number" && Number.isFinite(baseSelector);

  if (!hasBase) return [];

  let purchasesWhere;
  if (isNumericBase) {
    purchasesWhere = {
      [Op.or]: [
        { base_id: baseSelector },
        { location: baseSelector }
      ]
    };
  } else {
    purchasesWhere = { location: baseSelector };
  }
  
  const purchasedItems = await Purchase.findAll({
    where: purchasesWhere,
    attributes: ['item'],
    group: ['item'],
    ...options
  });

  const items = [];
  
  for (const purchase of purchasedItems) {
    const { available, purchasesQty, transfersInQty, transfersOutQty, assignedQty, expendedQty } = 
      await computeAvailable(purchase.item, baseSelector, null, options);
    
    const totalReceived = purchasesQty + transfersInQty;
    const totalUsed = assignedQty + expendedQty + transfersOutQty;
    const assignable = totalReceived - totalUsed;
    
    if (assignable > 0) {
      items.push({
        item: purchase.item,
        available: available,
        assignable: assignable,
        alreadyAssigned: assignedQty
      });
    }
  }

  const transfersInWhere = isNumericBase
    ? { destination_base_id: baseSelector }
    : { destinationLocation: baseSelector };
  
  const transferredItems = await Transfer.findAll({
    where: transfersInWhere,
    attributes: ['item'],
    group: ['item'],
    ...options
  });

  for (const transfer of transferredItems) {
    const existingItem = items.find(i => i.item === transfer.item);
    if (!existingItem) {
      const { available, purchasesQty, transfersInQty, transfersOutQty, assignedQty, expendedQty } = 
        await computeAvailable(transfer.item, baseSelector, null, options);
      
      const totalReceived = purchasesQty + transfersInQty;
      const totalUsed = assignedQty + expendedQty + transfersOutQty;
      const assignable = totalReceived - totalUsed;
      
      if (assignable > 0) {
        items.push({
          item: transfer.item,
          available: available,
          assignable: assignable,
          alreadyAssigned: assignedQty
        });
      }
    }
  }

  return items.sort((a, b) => a.item.localeCompare(b.item));
};

export const getAvailableItemsForExpenditure = async (baseSelector, options = {}) => {
  const hasBase = baseSelector !== null && baseSelector !== undefined && baseSelector !== "";
  const isNumericBase = hasBase && typeof baseSelector === "number" && Number.isFinite(baseSelector);

  if (!hasBase) return [];

  const purchasesWhere = isNumericBase
    ? { base_id: baseSelector }
    : { location: baseSelector };
  
  const purchasedItems = await Purchase.findAll({
    where: purchasesWhere,
    attributes: ['item'],
    group: ['item'],
    ...options
  });

  const items = [];
  
  for (const purchase of purchasedItems) {
    const { available } = await computeAvailable(purchase.item, baseSelector, null, options);
    if (available > 0) {
      items.push({
        item: purchase.item,
        available: available
      });
    }
  }

  const transfersInWhere = isNumericBase
    ? { destination_base_id: baseSelector }
    : { destinationLocation: baseSelector };
  
  const transferredItems = await Transfer.findAll({
    where: transfersInWhere,
    attributes: ['item'],
    group: ['item'],
    ...options
  });

  for (const transfer of transferredItems) {
    const existingItem = items.find(i => i.item === transfer.item);
    if (!existingItem) {
      const { available } = await computeAvailable(transfer.item, baseSelector, null, options);
      if (available > 0) {
        items.push({
          item: transfer.item,
          available: available
        });
      }
    }
  }

  return items.sort((a, b) => a.item.localeCompare(b.item));
};

export const getPersonnelList = async (baseSelector, options = {}) => {
  const hasBase = baseSelector !== null && baseSelector !== undefined && baseSelector !== "";
  
  if (!hasBase) return [];

  const basePersonnel = {
    "Alpha": [
      "Alpha Squad A",
      "Alpha Squad B", 
      "Alpha Squad C",
      "Alpha Commander",
      "Alpha Logistics"
    ],
    "Beta": [
      "Beta Squad A",
      "Beta Squad B",
      "Beta Squad C", 
      "Beta Commander",
      "Beta Logistics"
    ],
    "Charley": [
      "Charley Squad A",
      "Charley Squad B",
      "Charley Squad C",
      "Charley Commander", 
      "Charley Logistics"
    ],
    "Delta": [
      "Delta Squad A",
      "Delta Squad B",
      "Delta Squad C",
      "Delta Commander",
      "Delta Logistics"
    ]
  };

  if (typeof baseSelector === "number") {
    return Object.values(basePersonnel).flat().sort();
  }

  const baseName = baseSelector;
  return basePersonnel[baseName] || [];
};

export const getAvailableItemsForTransfer = async (baseSelector, options = {}) => {
  const hasBase = baseSelector !== null && baseSelector !== undefined && baseSelector !== "";
  const isNumericBase = hasBase && typeof baseSelector === "number" && Number.isFinite(baseSelector);

  if (!hasBase) return [];

  let purchasesWhere;
  if (isNumericBase) {
    purchasesWhere = {
      [Op.or]: [
        { base_id: baseSelector },
        { location: baseSelector }
      ]
    };
  } else {
    purchasesWhere = { location: baseSelector };
  }
  
  const purchasedItems = await Purchase.findAll({
    where: purchasesWhere,
    attributes: ['item'],
    group: ['item'],
    ...options
  });

  const items = [];
  
  for (const purchase of purchasedItems) {
    const { available } = await computeAvailable(purchase.item, baseSelector, null, options);
    if (available > 0) {
      items.push({
        item: purchase.item,
        available: available
      });
    }
  }

  const transfersInWhere = isNumericBase
    ? { destination_base_id: baseSelector }
    : { destinationLocation: baseSelector };
  
  const transferredItems = await Transfer.findAll({
    where: transfersInWhere,
    attributes: ['item'],
    group: ['item'],
    ...options
  });

  for (const transfer of transferredItems) {
    const existingItem = items.find(i => i.item === transfer.item);
    if (!existingItem) {
      const { available } = await computeAvailable(transfer.item, baseSelector, null, options);
      if (available > 0) {
        items.push({
          item: transfer.item,
          available: available
        });
      }
    }
  }

  return items.sort((a, b) => a.item.localeCompare(b.item));
};

export const getCurrentStock = async (baseId, item) => {
  const { available } = await computeAvailable(item, Number(baseId));
  
  return {
    item,
    baseId: Number(baseId),
    currentStock: available
  };
};
