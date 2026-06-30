# Plan: Pre-Deployment Fixes for Portfolio Website

This plan addresses 7 requirements across admin features, UI fixes, and content cleanup before Vercel deployment.

## Steps

1. **Add About page editing to admin dashboard** - Create `AboutContent` type in `src/types/index.ts`, add DB schema in `database.ts` / `database-unified.ts`, create API route at `src/app/api/admin/about/route.ts`, add new "About" tab with editor form in `src/app/admin/dashboard/page.tsx`

2. **Fix card layouts with consistent heights** - Standardize `ProjectCard.tsx` with `min-h-[X]` and flex layout, update `CertificateCard.tsx` sizing, refactor `mind-palace/page.tsx` inline cards into a reusable `BlogCard` component

3. **Remove emojis from UI** - Strip emojis from: admin dashboard tabs (🏆📝🚀), `uses/page.tsx` sections (⚡🎨🛠️), `sandbox/page.tsx` title (🏖️), and `mind-palace/page.tsx` decorations (🧠🤔🚀)

4. **Complete sandbox page** - Verify all 7 playground components render correctly (Snake, 2048, Memory, Typing, Pixel Art, Algorithms, Data Viz), ensure consistent styling, consider removing or clearly marking "Future" AI section items

5. **Fix contact page** - Resolve email inconsistency (Hero uses `rishi.sk.j@gmail.com`, Contact uses `rishijha2025@gmail.com`), potentially add contact form with API submission

6. **Fix StarBorder animation** - Debug keyframes in `globals.css` (opacity 1→0 causing flicker), remove duplicate definitions in `tailwind.config.ts`, adjust `StarBorder.tsx` timing

7. **Remove certification counter** - Delete lines 100-106 in `certifications/page.tsx` showing the badge count

## Further Considerations

1. **Emoji replacement strategy** - Replace with Lucide React SVG icons / Remove entirely with no replacement?
2. **Contact page scope** - Just fix email + styling, or add a full contact form with backend?
3. **About editing approach** - Store in database (requires PostgreSQL migration for prod) or create API that writes to MDX file directly?
