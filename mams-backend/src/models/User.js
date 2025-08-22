import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Base } from "./Base.js";

export const User = sequelize.define("User", {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  username: { 
    type: DataTypes.STRING(50), 
    allowNull: false, 
    unique: true 
  },
  password: { 
    type: DataTypes.STRING(255), 
    allowNull: false 
  },
  role: {
    type: DataTypes.ENUM("admin", "base_commander", "logistics"),
    allowNull: false,
    defaultValue: "logistics"
  },
  base_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: true 
  }
}, { 
  tableName: "users", 
  timestamps: true, 
  underscored: true 
});

User.belongsTo(Base, { 
  foreignKey: { name: "base_id", allowNull: true }, 
  targetKey: "id", 
  as: "base", 
  onUpdate: "CASCADE", 
  onDelete: "SET NULL" 
});

Base.hasMany(User, { 
  foreignKey: { name: "base_id", allowNull: true }, 
  sourceKey: "id", 
  as: "users", 
  onUpdate: "CASCADE", 
  onDelete: "SET NULL" 
});
