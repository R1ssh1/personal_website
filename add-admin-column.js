const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'data', 'portfolio.db');
const db = new Database(dbPath);

try {
  console.log('Adding is_admin column to admin_users table...');

  // Add the missing is_admin column with default value 1 (true)
  db.prepare('ALTER TABLE admin_users ADD COLUMN is_admin INTEGER DEFAULT 1').run();

  console.log('Column added successfully!');

  // Verify the update
  const columns = db.prepare("PRAGMA table_info(admin_users)").all();
  console.log('Updated columns in admin_users table:', columns);

  // Check the admin user now
  const adminUser = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin');
  console.log('Admin user after update:', adminUser);

} catch (error) {
  console.error('Error updating database:', error);
} finally {
  db.close();
}