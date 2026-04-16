# Master Project Plan: Family Tree Viewer

## Objective
To develop a web-based Family Tree Viewer using vanilla HTML, CSS, and JS (D3.js), focusing on a clean layout, proper spouse visualization, and performance, without requiring server-side processing for the CSV data file.

## Phases

### Phase 1: Baseline Refactor (Status: In Progress)
- Restructure project into separate files (`index.html`, `styles.css`, `app.js`).
- Ensure core functionalities (CSV upload, tree rendering, zoom/pan) remain intact.
- Create `Master_Project_Plan.md` and `CONTEXT.md` as single sources of truth.

### Phase 2: Layout Fix (Status: Pending)
- Implement compact spacing for larger trees like Family Echo.
- Fix spouse visual node to correctly attach to waris instead of appearing in the main hierarchy.
- Implement auto-fit and reset view functionality.

### Phase 3: Hardening (Status: Pending)
- Add CSV validation.
- Name normalization.
- Viewport-safe tooltips.
- Switchable layout modes (compact vs standard).

## Tech Stack
- HTML5
- CSS3 (Vanilla)
- JavaScript (ES6+ Vanilla)
- D3.js (for tree rendering)

## Constraints
- **No JS Frameworks** (e.g., React, Vue, Angular).
- **Maintain CSV Format**: Do not alter the expected column structure of the CSV data.
- **Root Directory**: All files must reside in or be referenced from the project root (`\TreeViewer`).
- **No additional planning docs**: Maintain updates strictly in this file and `CONTEXT.md`.
