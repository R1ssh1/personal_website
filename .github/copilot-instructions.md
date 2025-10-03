# Copilot Instructions for Personal Portfolio Website

## Project Overview
This is a hybrid portfolio website built with **Next.js 14 App Router** that combines:
- **Static MDX content** for projects/blog posts (`content/` directory)
- **Dynamic admin dashboard** with SQLite database for certifications/dynamic content
- **File-based authentication** using bcrypt and HTTP-only cookies

## Architecture Pattern
The codebase follows a **dual-content strategy**:
- **Public content**: MDX files parsed by `src/lib/mdx.ts` for static content (projects, blog, about, uses)
- **Admin content**: SQLite database managed via `src/lib/database.ts` for dynamic content (certifications, projects, blog posts)

## ⚠️ Known Critical Issues
1. **Authentication Problems**: Logout function doesn't work properly, admin routes not fully protected
2. **Content Upload Issues**: Blog posts, projects, and certifications not visible on respective pages after creation
3. **Database Persistence**: SQLite on Vercel doesn't persist across deployments - needs migration to hosted DB
4. **Development Server**: Multiple server instances can conflict - always check if server is running first

## Key Development Workflows

### Initial Setup (Required)
```bash
npm run setup  # Creates admin user + seeds certifications DB
```
This runs `scripts/setup-admin.js` and `scripts/seed-certifications.js`.

### Development Server Management
**CRITICAL**: Always check if dev server is already running before starting new one:
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000
# Kill process if needed, then start fresh
npm run dev
```

### Admin Workflows (Dashboard at `/admin/dashboard`)

#### Certifications Management:
- **Add new cert**: Upload image & PDF + fill metadata (title, issuer, dates)
- **Update details**: Fix typos, update expiration dates 
- **Delete cert**: Remove from database (rare but supported)

#### Projects Management:
- **Add project**: Title, description, tech stack, GitHub/demo links, thumbnail
- **Mark as featured**: Toggle featured flag for homepage display
- **Archive projects**: Set archived status (if implemented)

#### Blog Management:
- **Draft → Preview → Publish** workflow
- **Edit published posts**: Update content, metadata
- **Rich text editing**: Uses TinyMCE editor in admin forms

### Content Management
- **Static content**: Edit MDX files in `content/` (auto-reloads in dev)
  - `content/about.mdx` - Personal bio and skills
  - `content/uses.mdx` - Tools and software setup
  - `content/blog/` - Blog posts with frontmatter
  - `content/projects/` - Project showcases
- **Dynamic content**: Use `/admin/dashboard` (requires authentication)
- **File uploads**: Handled by `@vercel/blob` integration in admin forms

### Database Operations
- **Database file**: `data/portfolio.db` (SQLite with WAL mode)
- **Schema**: Auto-created by `initializeDatabase()` in `database.ts`
- **Admin auth**: Session-based with middleware protection on `/admin/dashboard/*`
- **⚠️ Production Warning**: SQLite doesn't persist on Vercel - migrate to Neon Postgres/Supabase/PlanetScale

### Debugging Known Issues
- **Authentication**: 
  - Logout API exists at `/api/admin/logout` but doesn't work properly
  - Admin routes partially protected via `middleware.ts`
  - Session management via `useAuth` hook needs fixing
- **Content Visibility**:
  - Admin-created content (blogs, projects, certs) not appearing on public pages
  - Check API routes in `src/app/api/` for CRUD operations
  - Verify database writes and public page queries
- **Development Server Conflicts**:
  - Kill existing Node processes before starting `npm run dev`
  - Use Windows Task Manager or `taskkill /f /im node.exe` if needed

## Critical Patterns

### MDX Content Structure
All MDX files require specific frontmatter:
```mdx
---
title: "Required"
summary: "Required brief description" 
date: "YYYY-MM-DD"
slug: "auto-generated-from-filename"
# Optional: technologies, github, demo, featured, tags
---
```

### Database Models
Core entities in `src/types/index.ts`:
- `AdminUser` + `AdminSession` (auth system)
- `Certification`, `Project`, `BlogPost` (dynamic content)
- All use UUID primary keys, ISO date strings

### Component Architecture
- `ClientOnly` wrapper for hydration-sensitive components
- `MDXContent` for rendering MDX with custom components
- `UnifiedContentForm` handles both create/edit states for admin forms
- `ThemeProvider` wraps app for dark/light mode (uses `next-themes`)

### Authentication Flow
1. Login at `/admin` sets HTTP-only cookie via `src/lib/auth.ts`
2. `middleware.ts` protects `/admin/dashboard/*` routes
3. Sessions auto-expire after 7 days, cleanup on invalid access

### Styling Conventions
- **Fonts**: `--font-nav` (Inter) for UI, `--font-logo` (Playfair Display) for headings
- **Theme**: CSS variables in `globals.css`, toggled by `next-themes`
- **Responsive**: Mobile-first Tailwind classes

## File Upload Pattern
```typescript
// In admin forms - uses Vercel Blob storage
import { put } from '@vercel/blob'
const blob = await put(filename, file, { access: 'public' })
// Store blob.url in database
```

## Common Development Tasks

### Adding New Content Types
1. Add TypeScript interface to `src/types/index.ts`
2. Create database table in `src/lib/database.ts`
3. Add CRUD operations following existing patterns
4. Create admin form component extending `UnifiedContentForm` pattern

### Adding New Static Pages
1. Create directory in `src/app/` with `page.tsx`
2. Add corresponding MDX file in `content/` if needed
3. Update `src/components/Navigation.tsx` for nav links
4. Follow existing layout pattern with proper metadata

### Debugging Database Issues
- Check `data/portfolio.db` exists and has correct permissions
- Verify `initializeDatabase()` ran successfully
- Use `better-sqlite3` CLI tools for direct DB inspection

## External Dependencies
- **Vercel Blob**: File storage for admin uploads
- **TinyMCE**: Rich text editor in admin dashboard
- **Framer Motion**: Animations (imported as needed)
- **Shiki + rehype-pretty-code**: Syntax highlighting in MDX

## Deployment Notes
- `vercel.json` configures rewrites for admin routes
- Database persists via Vercel's filesystem (not recommended for production)
- Environment variables: `ADMIN_USERNAME`, `ADMIN_PASSWORD` for initial setup

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