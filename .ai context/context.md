FILE: .ai context/context.md [AUTO GENERATED DO NOT EDIT MANUALLY]

## Project Snapshot
Stack: HTML, CSS, JavaScript (Vanilla), Vite, Supabase
Active module: Admin Dashboard (Gallery Management)
Architecture pattern: Simple MPA with a central site-renderer.js for static generation.

## Completed in This Session
[x] Supabase integration for Gallery (Alt Text, Albums)
[x] Bulk Delete functionality
[x] PWA Optimization (Service Worker Cache-First)
[x] Accessibility Audit (ARIA labels)
[x] Premium 404 Page
[x] DB Schema Update (alt_text column)

## Current Task
[ ] Finalize Admin UI Aesthetics (Glassmorphism, Theme Stability)
[ ] Resolve remaining upload/RLS issues

## Key Contracts
addGalleryItem(item) → data [inserts gallery record with alt_text]
renderGalleryItem(item) → string [browser-side gallery card generator]
applyTheme(theme) → void [switches data-theme and icons]

## Open Decisions / Assumptions
ASSUME: Supabase RLS is the main blocker for the empty gallery list despite "Success" SQL.
ASSUME: Hardcoded styles in some browser defaults are causing "invisible" select options.
