const fs = require('fs');
const { parse } = require('pg-connection-string');
const { Pool } = require('pg');

async function run() {
  let url = '';
  try {
    let envContent = fs.readFileSync('.env', 'utf-8');
    // If it looks like UTF-16 (starts with null bytes or regex fails), try utf-16le
    if (envContent.includes('\0')) {
      envContent = fs.readFileSync('.env', 'utf-16le');
    }
    
    // Support UTF-16LE characters and standard UTF-8
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) {
      url = match[1];
    } else {
      // Try parsing manually line by line
      const lines = envContent.split(/\r?\n/);
      for (const line of lines) {
        if (line.trim().startsWith('DATABASE_URL=')) {
          url = line.trim().substring('DATABASE_URL='.length).replace(/["']/g, '');
          break;
        }
      }
    }
  } catch (e) {
    console.error("❌ Could not read .env file. Make sure it exists.");
    return;
  }

  if (!url) {
    console.error("❌ DATABASE_URL is not set in your .env file.");
    return;
  }

  console.log("🔍 Checking your DATABASE_URL format...");
  
  // 1. Check for quotes
  if (url.startsWith('"') || url.startsWith("'")) {
    console.error("❌ Error: Your URL starts with a quote. Please remove the quotes around the URL in your environment variables.");
    return;
  }

  // 2. Check for brackets
  if (url.includes('[') || url.includes(']')) {
    console.error("❌ Error: Your URL contains square brackets '[' or ']'. Please remove them from the password.");
    return;
  }

  // 3. Try to parse using native URL (this is what crashes pg-connection-string)
  try {
    new URL(url);
    console.log("✅ URL format is valid (no parse errors).");
  } catch (e) {
    console.error("❌ Error: Node.js cannot parse this URL. There is an invalid character in your password (like an un-encoded #, @, ?, etc).");
    console.error("Details:", e.message);
    return;
  }

  // 4. Try pg-connection-string
  let config;
  try {
    config = parse(url);
    console.log(`✅ pg-connection-string parsed successfully. Host: ${config.host}, Port: ${config.port}`);
  } catch (e) {
    console.error("❌ Error: pg-connection-string failed to parse.");
    console.error(e);
    return;
  }

  // 5. Try connecting
  console.log("🔌 Attempting to connect to the database...");
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log("✅ Database connection successful!");
    
    // Check if tables exist
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
      );
    `);
    
    if (result.rows[0].exists) {
      console.log("✅ Tables are initialized. You are ready to log in!");
    } else {
      console.log("⚠️ Connection works, but tables are not initialized. You need to run /api/setup.");
    }
    
    client.release();
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
}

run();
