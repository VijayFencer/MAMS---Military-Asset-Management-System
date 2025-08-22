import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Base = sequelize.define("Base", {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  name: { 
    type: DataTypes.STRING(100), 
    allowNull: false, 
    unique: true 
  },
  code: { 
    type: DataTypes.STRING(20), 
    allowNull: false, 
    unique: true 
  },
  location: { 
    type: DataTypes.STRING(120) 
  }
}, { 
  tableName: "bases", 
  timestamps: true, 
  underscored: true 
});
