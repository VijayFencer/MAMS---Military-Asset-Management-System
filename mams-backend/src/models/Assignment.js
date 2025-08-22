import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Assignment = sequelize.define("Assignment", {
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
  personnel: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  dateAssigned: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: "assigned",
  },
  base_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: true 
  },
}, {
  tableName: "assignments",
  timestamps: true,
  underscored: true,
});
