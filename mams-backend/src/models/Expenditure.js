import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Expenditure = sequelize.define("Expenditure", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  item: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    validate: { min: 1 },
  },
  baseLocation: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  base_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: true 
  },
}, {
  tableName: "expenditures",
  timestamps: true,
  underscored: true,
});
