const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'data', 'portfolio.db');
const db = new Database(dbPath);

try {
  // Check if certifications table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('All tables:', tables.map(t => t.name));

  // Check certifications table schema
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='certifications'").get();
  console.log('Certifications table schema:', schema);

  // Get all certifications
  const certifications = db.prepare('SELECT * FROM certifications').all();
  console.log('Number of certifications:', certifications.length);
  console.log('Certifications:', certifications);

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}