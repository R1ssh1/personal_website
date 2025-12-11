const Database = require('better-sqlite3');
const db = new Database('data/portfolio.db');

console.log('Checking projects table structure...\n');

const cols = db.prepare('PRAGMA table_info(projects)').all();
console.log('Current columns:');
cols.forEach(col => {
  console.log(`  ${col.name} (${col.type})`);
});

const hasImages = cols.some(c => c.name === 'images');
console.log(`\n✅ Has images column: ${hasImages}`);

if (!hasImages) {
  console.log('\n⚠️ Adding images column...');
  db.exec(`ALTER TABLE projects ADD COLUMN images TEXT DEFAULT '[]'`);
  console.log('✅ Images column added!');
  
  const updatedCols = db.prepare('PRAGMA table_info(projects)').all();
  console.log('\nUpdated columns:');
  updatedCols.forEach(col => {
    console.log(`  ${col.name} (${col.type})`);
  });
}

db.close();
