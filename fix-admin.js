const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'data', 'portfolio.db');
const db = new Database(dbPath);

try {
  // Check current admin user status
  const currentUser = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin');
  console.log('Current admin user:', currentUser);

  if (!currentUser) {
    console.log('Admin user not found!');
    process.exit(1);
  }

  // Update admin status to true (1)
  const updateResult = db.prepare('UPDATE admin_users SET is_admin = 1 WHERE username = ?').run('admin');
  console.log('Update result:', updateResult);

  // Verify the update
  const updatedUser = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin');
  console.log('Updated admin user:', updatedUser);

  console.log('Admin user fixed successfully!');
} catch (error) {
  console.error('Error fixing admin user:', error);
} finally {
  db.close();
}