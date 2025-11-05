# Development Scripts

This directory contains utility scripts for database management, content migration, and validation.

## 📋 Quick Reference

```powershell
# Database Management
npm run setup              # Initial setup (admin + certifications)
npm run db:reset          # Reset database completely
npm run db:validate       # Validate database after migration

# Content Management
npm run export:mdx        # Export DB content to MDX files
npm run validate:mdx      # Validate MDX frontmatter schema
```

---

## 🔧 Database Scripts

### `setup-admin.js`
Creates the initial admin user account.

**Usage:**
```powershell
npm run setup-admin
```

**Environment Variables Required:**
- `ADMIN_USERNAME` - Default: "admin"
- `ADMIN_PASSWORD` - Default: "password123"

**What it does:**
1. Checks if admin user already exists
2. Hashes password with bcrypt (12 rounds)
3. Creates admin user record in database
4. Displays credentials for login

---

### `seed-certifications.js`
Populates the database with sample certifications (Credly badges).

**Usage:**
```powershell
npm run seed-certifications
```

**What it does:**
- Adds sample AWS, Azure, and other certifications
- Useful for development and testing
- Safe to run multiple times (checks for duplicates)

---

### `reset-db.ps1` 🆕
**PowerShell script** - Completely resets the database.

**Usage:**
```powershell
npm run db:reset
```

**What it does:**
1. Deletes `data/portfolio.db`
2. Deletes WAL and SHM files
3. Runs `npm run setup` to recreate and seed
4. Displays success message

**⚠️ Warning:** This is destructive! All database content will be lost.

---

### `validate-migration.js` 🆕
Tests database connectivity and CRUD operations.

**Usage:**
```powershell
npm run db:validate
```

**What it does:**
1. ✅ Tests read operations (certifications, projects, blog posts)
2. ✅ Tests create operations (with test data)
3. ✅ Tests update operations
4. ✅ Tests delete operations
5. ✅ Tests data integrity (field types, arrays, dates)
6. 🧹 Cleans up test data

**Use cases:**
- After migrating from SQLite to PostgreSQL
- After schema changes
- When troubleshooting database issues

**Exit codes:**
- `0` - All tests passed
- `1` - One or more tests failed

---

## 📝 Content Scripts

### `export-mdx.js` 🆕
Exports database content to static MDX files.

**Usage:**
```powershell
npm run export:mdx
```

**What it does:**
1. Reads all blog posts from database
2. Reads all projects from database
3. Converts to MDX format with frontmatter
4. Writes to `content/blog/` and `content/projects/`
5. Skips files that already exist (no overwrites)

**Output:**
```
📝 Exporting blog posts...
  ✅ Exported: my-first-post.mdx
  ⚠️  Skipping "Existing Post" - file already exists

📊 Blog Posts: 3 exported, 1 skipped
```

**Use cases:**
- Backup database content
- Migrate from database to static MDX
- Create snapshots before migrations

---

### `validate-mdx.js` 🆕
Validates MDX frontmatter schema.

**Usage:**
```powershell
npm run validate:mdx
```

**What it does:**
1. Scans all `.mdx` files in `content/blog/` and `content/projects/`
2. Checks for required fields (title, summary, date, tags/technologies)
3. Checks for recommended fields (featured, github, demo, readTime)
4. Validates field types (arrays, dates)
5. Reports missing or invalid fields

**Output:**
```
📂 Validating blog (5 files)
──────────────────────────────────────────────────
✅ my-first-post.mdx
❌ broken-post.mdx:
   Missing required: date, tags
⚠️  incomplete-post.mdx:
   Missing recommended: featured

📊 VALIDATION SUMMARY
Files validated: 5
❌ Errors: 1
⚠️  Warnings: 1
```

**Use cases:**
- Pre-deployment validation
- CI/CD pipeline checks
- Catching content errors early

**Exit codes:**
- `0` - All files valid (or warnings only)
- `1` - One or more files have errors

---

## 🛠️ Utility Scripts

### `check-db.js`
Quick database inspection - shows record counts.

**Usage:**
```powershell
node check-db.js
```

---

### `check-db-schema.js`
Detailed table structure inspection.

**Usage:**
```powershell
node check-db-schema.js
```

**Output:**
- All tables and their columns
- Column types and constraints
- Foreign key relationships

---

### `check-certs.js`
Displays all certifications in the database.

**Usage:**
```powershell
node check-certs.js
```

---

## 🔄 Common Workflows

### Fresh Start (Development)
```powershell
# Reset everything and start clean
npm run db:reset
npm run dev
```

### Backup Database Content
```powershell
# Export all database content to MDX files
npm run export:mdx

# Validate exported MDX files
npm run validate:mdx
```

### After Migration (SQLite → PostgreSQL)
```powershell
# 1. Update DATABASE_URL in Vercel
vercel env add DATABASE_URL production

# 2. Deploy
vercel --prod

# 3. Validate migration
npm run db:validate
```

### Pre-Deployment Checks
```powershell
# Validate all MDX files
npm run validate:mdx

# Check for TypeScript errors
npm run lint

# Build project
npm run build
```

---

## 📚 Related Documentation

- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Database Migration Guide**: See "Migrating SQLite → PostgreSQL/Neon" in Copilot Instructions
- **Environment Variables**: `.env.example`

---

## 🆘 Troubleshooting

### "Database locked" error
```powershell
# Close all connections and reset
npm run db:reset
```

### Migration validation fails
```powershell
# Check DATABASE_URL environment variable
echo $env:DATABASE_URL

# Verify database-unified.ts is using correct database
# Check console output for "Using PostgreSQL" or "Using SQLite"
```

### PowerShell execution policy error
```powershell
# Run once to allow scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

**Last Updated:** October 2025
