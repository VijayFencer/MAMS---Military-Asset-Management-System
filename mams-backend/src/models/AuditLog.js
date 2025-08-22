import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const AuditLog = sequelize.define("AuditLog", {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  resource: {
    type: DataTypes.STRING(80),
  },
  resourceId: {
    type: DataTypes.STRING(80),
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING(50),
  },
  userAgent: {
    type: DataTypes.STRING(255),
  },
}, {
  tableName: "audit_logs",
  timestamps: true,
  underscored: true,
});
