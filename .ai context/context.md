## Project Snapshot
Stack: HTML, CSS, JavaScript (Vite SSG)
Active module: Global Layout & Header & Contact Page
Architecture pattern: Static Site generation with tokens.css/layout.css/site-renderer.js

## Completed in This Session
[x] Plan structure mapped
[x] Update src/data/site-content.json (Nested nav structure)
[x] Update src/build/site-renderer.js renderNavLinks() (Dropdown support)
[x] Update src/build/site-renderer.js renderHeader() (Dropdown support)
[x] Update src/build/site-renderer.js renderContactContent() (4-card grid redesign)
[x] Update src/build/site-renderer.js (Added icons: chevronDown, chevronRight, chat)
[x] Update src/styles/layout.css (Dropdown styles, contact card styles, watermark support)
[x] Verify build with npm run build

## Current Task
[ ] Awaiting feedback from the user.

## Key Contracts (do not break these)
renderNavLinks(items, currentPath, className) -> Returns nested HTML for dropdowns
renderContactContent(content) -> Uses .contact-cards-grid and .watermark-logo

## Open Decisions / Assumptions
ASSUME: Hover-based dropdowns are preferred for desktop as per the visual reference. Mobile menu remains a simplified slide-down.
