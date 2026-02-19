PH Anglers — Local SPA Prototype

What this is
- A single-page frontend prototype for "PH Anglers" — a social feed for Filipino anglers.
- Data is stored in `localStorage` (no server required).

How to run
1. Open `index.html` in your browser.

Notes
- Posts, profile edits, likes, and comments persist in `localStorage` under `ph_anglers_state_v1`.
- To reset data, clear site storage in your browser or run `localStorage.removeItem('ph_anglers_state_v1')` in the console.

Next steps (I can do for you)
- Add image uploads and cropping (client-side)
- Add a small Node/SQLite backend for persistence and auth
- Improve UI and add pagination/search filters
