## Project Snapshot
Stack: Vite, Vanilla JS, HTML, Supabase (JS Client)
Active module: admin/index.html & src/supabase/* & site-renderer
Architecture pattern: Static Site Generator with Client-Side Supabase integration

## Completed in This Session
[x] Firebase removed, Supabase-js installed
[x] .env.local created for Supabase keys
[x] vercel.json connect-src updated for *.supabase.co
[x] src/supabase/config.js, auth.js, gallery.js implemented
[x] admin/index.html refactored to use Supabase Auth & Storage API
[x] site-renderer.js lightbox bug fixed
[x] site-renderer.js gallery loading switched from static JSON to async getGalleryItems()
[x] loader.js isConnected double-fix implemented
[x] nav.js startsWith setActiveNavLink logic fixed & footer button added

## Current Task
[ ] Awaiting Next Steps (Todo list check or new features)

## Key Contracts (do not break these)
addGalleryItem(item) → insert into supabase gallery_items
uploadGalleryImage(file, path) → upload to supabase storage gallery bucket
renderGalleryPage() → renders gallery items to DOM

## Open Decisions / Assumptions
ASSUME: Supabase tables (`gallery_items`) and buckets (`gallery`) are properly created via Supabase dashboard with proper RLS policies since I don't have access to your Supabase dashboard.
ASSUME: `admin/index.html` inline script needs Vite module bundling (`admin` is added to vite.config.js inputs).
