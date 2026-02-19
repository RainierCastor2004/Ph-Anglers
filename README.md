PH Anglers — Local SPA Prototype

What this is
- A single-page frontend prototype for "PH Anglers" — a social feed for Filipino anglers.
- Data is stored in `localStorage` (no server required).

How to run
1. Open `index.html` in your browser.

Notes
- Posts, profile edits, likes, and comments persist in `localStorage` under `ph_anglers_state_v1`.
- To reset data, clear site storage in your browser or run `localStorage.removeItem('ph_anglers_state_v1')` in the console.
Deployment (publish online)

- Quick (Netlify / Vercel): drag-and-drop the project folder or connect your GitHub repo to either service — they will serve `index.html` automatically.

- GitHub Pages (CI): a GitHub Actions workflow has been added at `.github/workflows/deploy.yml`. To use it:
	1. Create a new GitHub repository and push this project to `main` (or `master`).
	2. The workflow will run on push and publish the site to the `gh-pages` branch. GitHub Pages can serve from that branch (enable Pages in repo settings if necessary).

- Manual: upload the contents of this folder to any static host (S3, Firebase Hosting, Surge, etc.).

Notes
- The GitHub Actions workflow uses the built-in `GITHUB_TOKEN` and `peaceiris/actions-gh-pages` to publish the repository root. If you prefer a different workflow (Netlify, Vercel, or a custom CI), tell me which provider and I can add specialized config.

Next steps (I can do for you)
- Add image uploads and cropping (client-side)
- Add a small Node/SQLite backend for persistence and auth
- Improve UI and add pagination/search filters
