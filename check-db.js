const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'data', 'portfolio.db');
const db = new Database(dbPath);

try {
  // Check the schema for admin_users table
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='admin_users'").get();
  console.log('Admin users table schema:', schema);

  // List all columns in admin_users table
  const columns = db.prepare("PRAGMA table_info(admin_users)").all();
  console.log('Columns in admin_users table:', columns);

  // Check current admin user
  const currentUser = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin');
  console.log('Current admin user:', currentUser);

} catch (error) {
  console.error('Error checking database:', error);
} finally {
  db.close();
}