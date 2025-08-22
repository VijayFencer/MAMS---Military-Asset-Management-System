import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Purchase = sequelize.define("Purchase", {
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
  price: {
    type: DataTypes.FLOAT.UNSIGNED,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: false,
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
  tableName: "purchases",
  timestamps: true,
  underscored: true,
});
