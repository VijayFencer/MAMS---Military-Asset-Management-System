import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Transfer = sequelize.define("Transfer", {
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
    validate: {
      min: 1,
    },
  },
  sourceLocation: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  destinationLocation: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'completed',
  },
  source_base_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: true 
  },
  destination_base_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: true 
  },
}, {
  tableName: "transfers",
  timestamps: true,
  underscored: true,
});
