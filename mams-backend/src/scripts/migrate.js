import { sequelize } from '../config/db.js';
import '../models/User.js';
import '../models/Base.js';
import '../models/Assignment.js';
import '../models/AuditLog.js';
import '../models/Expenditure.js';
import '../models/Purchase.js';
import '../models/Transfer.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateDatabase() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Sync all models with the database
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created/updated:');
    console.log('   - Users');
    console.log('   - Bases');
    console.log('   - Assignments');
    console.log('   - AuditLogs');
    console.log('   - Expenditures');
    console.log('   - Purchases');
    console.log('   - Transfers');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrateDatabase();
