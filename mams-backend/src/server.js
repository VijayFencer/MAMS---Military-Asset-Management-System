import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { initDatabase, sequelize } from "./config/db.js";
import { Base } from "./models/Base.js";
import { Purchase } from "./models/Purchase.js";

import authRoutes from "./routes/authRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import expenditureRoutes from "./routes/expenditureRoutes.js";
import baseRoutes from "./routes/baseRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

import { authenticate } from "./middleware/auth.js";
import { permit } from "./middleware/rbac.js";
import { auditMiddleware } from "./middleware/audit.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());
app.use(auditMiddleware.requestLogger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/expenditures", expenditureRoutes);
app.use("/api/bases", baseRoutes);
app.use("/api/dashboard", authenticate, dashboardRouter);

(async () => {
  await initDatabase();
  
  // Associations
  Purchase.belongsTo(Base, { foreignKey: 'base_id', as: 'base' });
  Base.hasMany(Purchase, { foreignKey: 'base_id', as: 'purchases' });
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    await sequelize.sync();
    console.log("✅ Models synced (development mode)");
  } else {
    try {
      await sequelize.sync({ alter: true });
      console.log("✅ Models synced with alter");
    } catch (error) {
      if (error.message.includes('Too many keys') || error.message.includes('ER_TOO_MANY_KEYS')) {
        console.error("❌ Database has too many indexes. Please run migrations instead of sync.");
        process.exit(1);
      } else {
        throw error;
      }
    }
  }

  app.listen(PORT, () => console.log(`🚀 API on http://localhost:${PORT}`));
})();
