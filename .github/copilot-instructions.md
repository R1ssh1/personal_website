# Copilot Instructions for Personal Portfolio Website

## Project Overview
Hybrid Next.js 14 App Router portfolio with **dual-content architecture**:
- **Static MDX**: File-based content in `content/` (projects, blog, about, uses)
- **Dynamic CMS**: SQLite (dev) / PostgreSQL (prod) for admin-managed content
- **Authentication**: Session-based with bcrypt + HTTP-only cookies

## Core Architecture

### Dual-Content Strategy
```
Public Site (Static)          Admin CMS (Dynamic)
─────────────────────         ───────────────────
content/blog/*.mdx    ←───→   SQLite: blog_posts table
content/projects/*.mdx ←───→   SQLite: projects table
                              SQLite: certifications table
                              
Parsed by: src/lib/mdx.ts     Managed by: src/lib/database-unified.ts
```

**Key Insight**: `database-unified.ts` automatically switches between SQLite (dev) and PostgreSQL (prod) based on `DATABASE_URL` env var. Both MDX and database content can coexist for the same type (e.g., MDX projects + DB projects).

### MDX + Database Sync Pattern
**Content Authority Decision Tree**:
```
┌─ MDX files (content/*)
│   └─ Source of truth for: about.mdx, uses.mdx, legacy blog/project posts
│   └─ Modified by: Direct file edits
│   └─ Does NOT sync to database automatically
│
└─ Database (SQLite/Postgres)
    └─ Source of truth for: admin-created content, certifications
    └─ Modified by: Admin dashboard forms
    └─ Does NOT sync to MDX automatically
```

**Critical Rules**:
1. **MDX → Database**: No automatic sync. If you need DB records, manually create via admin dashboard
2. **Database → MDX**: No automatic export. Admin content stays in DB only
3. **Coexistence**: Public pages query BOTH sources and merge results
4. **Conflicts**: If same slug exists in both, MDX typically takes precedence (check individual page logic)

**Example - Blog Posts**:
```typescript
// src/app/blog/page.tsx - merges both sources
const mdxPosts = getAllBlogPosts()        // From content/blog/*.mdx
const dbPosts = await blogPostsDb.getAll() // From database
const allPosts = [...mdxPosts, ...adaptDbPosts(dbPosts)].sort(...)
```

### Database Layer Architecture
- **Development**: SQLite (`data/portfolio.db`) with WAL mode for concurrency
- **Production**: PostgreSQL via `DATABASE_URL` (automatic failover in `database-unified.ts`)
- **Models**: 5 core tables (admin_users, admin_sessions, certifications, projects, blog_posts)
- **Schema**: Auto-initialized via `initializeDatabase()` with migration support
- **Data**: JSON strings for arrays (tags, techStack, images) - parse/stringify on read/write

### Authentication System
```
Login Flow:
1. POST /api/admin/login → verifyPassword() → createSession()
2. HTTP-only cookie 'admin_session' set (7-day expiry)
3. middleware.ts checks session on /admin/dashboard/* routes
4. Session validated via adminSessionsDb.getById() + adminUsersDb.getById()
```

**Critical Files**:
- `src/lib/auth.ts` - Session creation/validation (async wrappers)
- `middleware.ts` - Route protection for `/admin/dashboard/*`
- `src/app/api/admin/login/route.ts` - Login endpoint
- `src/hooks/useAuth.ts` - Client-side auth state hook

## ⚠️ Known Critical Issues
1. **Authentication**: Logout doesn't clear sessions properly, session cleanup incomplete
2. **Content Visibility**: Admin-created content not appearing on public pages (DB query vs MDX mismatch)
3. **Database Persistence**: SQLite doesn't persist on Vercel - manual migration to Postgres needed
4. **Dev Server Conflicts**: Port 3000 conflicts common on Windows - kill `node.exe` before restarting

## Essential Development Workflows

### First-Time Setup
```powershell
npm install
npm run setup  # Creates admin user + seeds certifications
npm run dev    # Start dev server on http://localhost:3000
```
**What happens**: `setup-admin.js` creates admin user (credentials from env), `seed-certifications.js` populates sample certifications.

### Development Server (Windows PowerShell)
```powershell
# Always check for conflicts first
netstat -ano | findstr :3000
# If port is in use, kill the process
taskkill /f /pid <PID>
# Then start clean
npm run dev
```

### Working with MDX Content
**Files**: `content/{projects,blog}/*.mdx` + `content/{about,uses}.mdx`

Required frontmatter structure:
```mdx
---
title: "Project Title"
summary: "Brief description"
date: "2024-01-15"
slug: "auto-from-filename"  # Don't manually set
technologies: ["React", "Next.js"]  # Projects only
tags: ["tutorial", "typescript"]    # Blog only
featured: true                      # Optional
github: "https://github.com/..."    # Optional
demo: "https://demo.com"            # Optional
---
```

**Functions**: `getAllProjects()`, `getProjectBySlug()`, `getAllBlogPosts()`, `getBlogPostBySlug()` from `src/lib/mdx.ts`

### Admin Dashboard Workflows
**Access**: `/admin` → login → redirects to `/admin/dashboard`

#### API Routes Pattern (Zod validation):
```typescript
// Example: src/app/api/admin/certifications/route.ts
POST /api/admin/certifications
  - requireAuth() middleware check
  - Zod schema validation
  - certificationsDb.create() → returns UUID
  - Response: 201 with created object

GET /api/admin/certifications
  - No auth required (public read)
  - certificationsDb.getAll()
  - Response: Array of certifications

PUT /api/admin/certifications/[id]
  - requireAuth()
  - certificationsDb.update(id, partial)
  - Response: 200 with updated object
```

#### File Upload Flow (Vercel Blob):
```typescript
// In admin forms
import { put } from '@vercel/blob'

const blob = await put(filename, file, { 
  access: 'public',
  addRandomSuffix: true 
})
// Store blob.url in database (imageUrl, featuredImage fields)
```

**Image Configuration**: `next.config.js` allows `*.vercel-storage.com` and `images.credly.com` via `remotePatterns`.

### Secrets & Credentials Rotation
**Admin Password Reset**:
```powershell
# Generate new password hash locally
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('NEW_PASSWORD', 12).then(console.log)"

# Update database directly
# SQLite: Open data/portfolio.db in DB Browser
# UPDATE admin_users SET password_hash = '<new_hash>' WHERE username = 'admin';

# Or delete DB and re-run setup with new env vars
$env:ADMIN_PASSWORD = "new_secure_password"
npm run setup-admin
```

**Session Secret Rotation** (if implemented):
```powershell
# Generate cryptographically secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update Vercel environment variable
vercel env add SESSION_SECRET production
# Paste generated secret

# Redeploy to apply
vercel --prod
```

**⚠️ Important**: Rotating secrets invalidates all existing sessions - users must re-login.

## Critical Code Patterns

### Component Architecture
**Hydration-Safe Pattern** - `ClientOnly` wrapper:
```tsx
// src/components/ClientOnly.tsx - prevents SSR/client mismatch
import { ClientOnly } from '@/components/ClientOnly'

<ClientOnly fallback={<LoadingSpinner />}>
  <InteractiveComponent />
</ClientOnly>
```

**Theming** - Root layout setup:
```tsx
// src/app/layout.tsx
<ThemeProvider>  {/* next-themes provider */}
  <StarryBackground />   {/* Canvas animation */}
  <MouseGradient />      {/* Cursor effect */}
  <Navigation />
  {children}
</ThemeProvider>
```

**Fonts**: CSS variables `--font-nav` (Inter) and `--font-logo` (Playfair Display) set in `layout.tsx`, used via Tailwind classes `font-nav` / `font-logo`.

### Database Access Pattern
**Always use `database-unified.ts`** - never import `database.ts` or `database-postgres.ts` directly:
```typescript
// ✅ Correct
import { certificationsDb, projectsDb } from '@/lib/database-unified'

// ❌ Wrong
import { certificationsDb } from '@/lib/database'
```

**Why**: `database-unified.ts` wraps synchronous SQLite calls in async wrappers and automatically switches to PostgreSQL in production based on `DATABASE_URL` environment variable.

**Array Fields**: Database stores arrays as JSON strings - parse on read, stringify on write:
```typescript
// Writing
await certificationsDb.create({
  tags: ['AWS', 'Cloud'],  // Auto-stringified by database layer
  // ...
})

// Reading
const cert = await certificationsDb.getById(id)
console.log(cert.tags)  // Already parsed array
```

### MDX Rendering
```tsx
// src/components/MDXContent.tsx - custom component overrides
import { MDXContent } from '@/components/MDXContent'

// Use in pages:
const { content, metadata } = getProjectBySlug(slug)
<MDXContent content={content} />  {/* Renders with syntax highlighting */}
```

**Syntax Highlighting**: Uses `rehype-pretty-code` + `shiki` configured in `next.config.js` via `@next/mdx` plugin.




## Common Development Tasks

### Adding New API Routes
Follow this pattern from `src/app/api/admin/certifications/route.ts`:
1. **Import requirements**:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import { requireAuth } from '@/lib/auth'
   import { z } from 'zod'
   import { certificationsDb } from '@/lib/database-unified'
   ```

2. **Define Zod schema** for validation
3. **Protected routes**: Use `await requireAuth()` at function start
4. **Public routes**: No auth check needed (GET endpoints)
5. **Error handling**: Catch `z.ZodError` separately from general errors

### Adding Static Pages
```typescript
// src/app/new-page/page.tsx
export const metadata = {
  title: 'Page Title',
  description: 'Page description for SEO'
}

export default function NewPage() {
  // For MDX content:
  const content = fs.readFileSync('content/new-page.mdx')
  return <MDXContent content={content} />
}
```

Update `src/components/Navigation.tsx` to add nav link.

### Database Schema Changes
1. **Modify** `src/lib/database.ts` - add columns to `CREATE TABLE IF NOT EXISTS` statement
2. **Add migration** in `migrateTables()` function using `PRAGMA table_info(table_name)`
3. **Update TypeScript types** in `src/types/index.ts`
4. **Recreate DB** in dev: Delete `data/portfolio.db` and restart server

### Migrating SQLite → PostgreSQL/Neon (Production)
**Why**: SQLite `data/portfolio.db` doesn't persist on Vercel - ephemeral filesystem.

**Migration Recipe**:
```powershell
# 1. Export SQLite to SQL dump
sqlite3 data/portfolio.db .dump > dump.sql

# 2. Create Neon/Postgres database
# Visit https://neon.tech or use Vercel Postgres
# Copy DATABASE_URL connection string

# 3. Import dump into Postgres
# Edit dump.sql first - remove SQLite-specific pragmas:
#   - DELETE: PRAGMA foreign_keys=OFF;
#   - DELETE: BEGIN TRANSACTION; / COMMIT;
#   - REPLACE: TEXT columns with VARCHAR or keep TEXT (Postgres supports both)

psql $DATABASE_URL -f dump.sql

# 4. Update Vercel environment variables
vercel env add DATABASE_URL production
# Paste connection string

# 5. Verify database-unified.ts switches to Postgres
# Check: usePostgres = process.env.DATABASE_URL && process.env.NODE_ENV === 'production'

# 6. Deploy and test
vercel --prod

# 7. Validation checklist
# - Login works (admin_sessions table accessible)
# - Certifications display on /certifications
# - Blog posts from DB appear on /blog
# - Admin CRUD operations (create, update, delete)
# - File uploads work (Vercel Blob unaffected)
```

**Known Migration Issues**:
- **JSON Arrays**: SQLite stores as TEXT, Postgres prefers JSONB - current code uses `JSON.parse/stringify` so compatible
- **WAL Mode**: Postgres doesn't need `PRAGMA journal_mode = WAL` (remove from dump)
- **Boolean Columns**: SQLite uses INTEGER (0/1), Postgres uses BOOLEAN - update `is_admin`, `published` columns:
  ```sql
  ALTER TABLE admin_users ALTER COLUMN is_admin TYPE BOOLEAN USING is_admin::boolean;
  ALTER TABLE blog_posts ALTER COLUMN published TYPE BOOLEAN USING published::boolean;
  ```
- **UUID vs TEXT**: Current schema uses TEXT for IDs (compatible) - could optimize to UUID type later

**Migration Validation Script**:
```javascript
// scripts/validate-migration.js
const { certificationsDb, projectsDb, blogPostsDb } = require('../src/lib/database-unified')

async function validate() {
  console.log('Testing database reads...')
  const certs = await certificationsDb.getAll()
  const projects = await projectsDb.getAll()
  const posts = await blogPostsDb.getAll()
  
  console.log(`✅ Certifications: ${certs.length}`)
  console.log(`✅ Projects: ${projects.length}`)
  console.log(`✅ Blog Posts: ${posts.length}`)
  
  console.log('\nTesting create operation...')
  const testId = await certificationsDb.create({
    title: 'Migration Test',
    issuer: 'Test',
    issueDate: new Date().toISOString(),
    description: 'Test entry',
    tags: ['test'],
    imageUrl: 'https://example.com/test.jpg'
  })
  console.log(`✅ Created test entry: ${testId}`)
  
  await certificationsDb.delete(testId)
  console.log('✅ Cleanup successful')
}

validate().catch(console.error)
```

## Debugging & Troubleshooting

### Database Issues
- **Location**: `data/portfolio.db` (SQLite file)
- **Schema check**: Run `node check-db-schema.js` or `node check-db.js`
- **Direct access**: Use `better-sqlite3` CLI or DB Browser for SQLite
- **Reset DB**: Delete `data/portfolio.db`, restart server (auto-recreates)

### Authentication Debug
- **Session cookie**: Look for `admin_session` in browser DevTools → Application → Cookies
- **Middleware logs**: Check console for `getSession debug:` output from `src/lib/auth.ts`
- **Manual session check**: Query `admin_sessions` table for active sessions

### Port Conflicts (Windows)
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill specific process
taskkill /f /pid <PID>

# Nuclear option - kill all Node processes
taskkill /f /im node.exe
```

### Content Not Appearing
**Problem**: Admin-created content doesn't show on public pages

**Check these files**:
- Public pages pull from **both** MDX files and database
- Verify API route queries match page component expectations
- Check `published` flag for blog posts (must be `true`)
- Confirm database writes with `node check-certs.js`

## Development Utilities

### Existing Scripts
- **`scripts/setup-admin.js`**: Creates admin user from `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars
- **`scripts/seed-certifications.js`**: Seeds sample certifications (Credly badges)
- **`check-db.js`**: Quick database schema inspection
- **`check-db-schema.js`**: Detailed table structure validation
- **`check-certs.js`**: Verify certifications table contents

**Usage**:
```powershell
node check-db-schema.js  # See all tables and columns
node check-certs.js      # Verify certification data
```

### Suggested Utilities (Not Yet Implemented)
Create these in `scripts/` for faster development:

**`scripts/reset-db.ps1`** - Complete database reset:
```powershell
# Delete existing database
Remove-Item data/portfolio.db -ErrorAction SilentlyContinue

# Recreate and seed
npm run setup
Write-Host "✅ Database reset complete"
```

**`scripts/export-mdx.js`** - Export DB content to MDX files:
```javascript
// Generate MDX files from database content for backup/migration
const { blogPostsDb, projectsDb } = require('../src/lib/database-unified')
const fs = require('fs')
const path = require('path')

async function exportToMDX() {
  const posts = await blogPostsDb.getAll()
  posts.forEach(post => {
    const frontmatter = `---
title: "${post.title}"
summary: "${post.excerpt}"
date: "${post.publishDate}"
tags: ${JSON.stringify(post.tags)}
---

${post.content}
`
    fs.writeFileSync(
      path.join('content/blog', `${post.title.toLowerCase().replace(/\s+/g, '-')}.mdx`),
      frontmatter
    )
  })
  console.log(`Exported ${posts.length} posts`)
}
```

**`scripts/validate-mdx.js`** - Check MDX frontmatter schema:
```javascript
// Ensure all MDX files have required fields
const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const required = ['title', 'summary', 'date']
const blogDir = path.join(__dirname, '../content/blog')

fs.readdirSync(blogDir).forEach(file => {
  const { data } = matter(fs.readFileSync(path.join(blogDir, file)))
  const missing = required.filter(field => !data[field])
  if (missing.length) {
    console.error(`❌ ${file}: Missing ${missing.join(', ')}`)
  }
})
```

## External Dependencies
- **Vercel Blob**: File storage for admin uploads
- **TinyMCE**: Rich text editor in admin dashboard
- **Framer Motion**: Animations (imported as needed)
- **Shiki + rehype-pretty-code**: Syntax highlighting in MDX

## Deployment Notes
- `vercel.json` configures security headers + Next.js settings
- **SQLite Warning**: Database doesn't persist on Vercel - migrate to Postgres/Neon for production
- **Environment variables**: `ADMIN_USERNAME`, `ADMIN_PASSWORD` (initial setup), `DATABASE_URL` (production DB)
- **Image hosting**: Configured for `*.vercel-storage.com` and `images.credly.com` in `next.config.js`

## Testing Strategy

**Current Status**: ⚠️ No formal test suite implemented. All testing is manual via:
- Admin dashboard validation (CRUD operations)
- API route testing with browser DevTools/Postman
- Visual regression testing on deployed previews

**Manual Testing Checklist**:
```
Auth Flow:
☐ Login at /admin with correct credentials
☐ Redirect to /admin/dashboard
☐ Access protected routes (/admin/dashboard/*)
☐ Logout clears session (KNOWN ISSUE)

Content Management:
☐ Create certification → appears on /certifications
☐ Edit blog post → updates on /blog/[slug]
☐ Delete project → removed from /projects
☐ Upload image → Vercel Blob URL saved correctly

Database Operations:
☐ SQLite writes persist in dev
☐ Postgres connection works in production
☐ Migration script runs without errors
☐ Array fields (tags, techStack) parse correctly
```

**Future Recommendations**:
When implementing automated tests, prioritize:

1. **Playwright E2E Tests** (`tests/e2e/`):
   ```typescript
   // tests/e2e/auth.spec.ts
   test('admin login flow', async ({ page }) => {
     await page.goto('/admin')
     await page.fill('input[name="username"]', 'admin')
     await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD)
     await page.click('button[type="submit"]')
     await expect(page).toHaveURL('/admin/dashboard')
   })
   ```

2. **API Integration Tests** (`tests/api/`):
   ```typescript
   // Test CRUD operations on certifications API
   describe('POST /api/admin/certifications', () => {
     it('requires authentication', async () => {
       const res = await fetch('/api/admin/certifications', {
         method: 'POST',
         body: JSON.stringify({...})
       })
       expect(res.status).toBe(401)
     })
   })
   ```

3. **Database Migration Tests**:
   - SQLite → Postgres data integrity checks
   - Schema validation after migration
   - Rollback procedures

**Test Setup (when ready)**:
```powershell
npm install -D @playwright/test vitest
npx playwright install

# Add to package.json
"test": "vitest",
"test:e2e": "playwright test"
```

## AI Agent Interaction Guidelines
When working with users on this project:

### Always Ask Clarifying Questions When:
- User request is ambiguous or could be interpreted multiple ways
- Multiple implementation approaches are possible
- User mentions UI/UX changes without specific design direction
- Technical decisions need user preference (e.g., database migration approach)
- Content management workflow isn't clear (static MDX vs admin dashboard)

### Before Making Changes:
- Verify which content system they want to modify (static MDX or admin DB)
- Ask about specific styling preferences for UI changes
- Confirm whether changes should affect public pages or admin dashboard
- Check if they want to fix known issues or add new features

### Development Best Practices:
1. **Always check for running servers** before starting `npm run dev`
2. **Ask about database migration** if working with admin content
3. **Clarify authentication requirements** for new admin features
4. **Confirm content visibility** expectations for new admin-created content

### Example Clarifying Questions:
- "Do you want to add this as static MDX content or through the admin dashboard?"
- "Should this styling change apply to the public site or admin interface?"
- "Are you looking to fix the existing authentication issues or add new features?"
- "Do you want me to help migrate from SQLite to a hosted database first?"
