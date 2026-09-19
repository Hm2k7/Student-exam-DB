# Student Exams

A simple static site for publishing HTML exams to students. Fully static (no backend, no build step) — designed to be pushed to GitHub and served with GitHub Pages.

## How it works

- [`index.html`](index.html) — public exam list. Sortable by name or date, with search.
- [`admin.html`](admin.html) — where you add exams. Drop in an `.html` file, give it a name, and it's saved with an automatic timestamp.
- [`view.html`](view.html) — the page students open. It wraps the raw exam HTML in an iframe with a toolbar showing the exam name and a **Copy link** button.
- [`data/exams.json`](data/exams.json) — the manifest listing every exam (id, name, filename, timestamp). This is what `index.html` and `view.html` read.
- [`exams/`](exams/) — folder holding the actual exam `.html` files you drop in.
- [`assets/`](assets/) — shared CSS/JS.

The whole UI is pure greyscale (no color) via CSS variables in [`assets/style.css`](assets/style.css), including a dark-mode variant.

## Running locally (required for the Admin panel)

Browsers block both `fetch()` of local JSON files and the File System Access API on plain double-clicked `file://` pages. Serve the folder over `http://localhost` instead:

```bash
npx serve .
```

or, with Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:<port>/index.html` (public list) or `http://localhost:<port>/admin.html` (admin).

**The Admin panel needs Chrome or Edge** (desktop) — it uses the File System Access API to write files directly into your project folder. Firefox and Safari don't support this API yet.

## Adding an exam

1. Open `admin.html` in Chrome/Edge over `http://localhost`.
2. Click **Connect folder** and select this project's root folder (the one with `index.html` in it). Grant read/write permission when prompted. It's remembered for next time.
3. Type the exam's name, then drag-and-drop (or browse to) the exam `.html` file.
4. Click **Add exam** — this writes the file into `exams/` and adds an entry (with the current timestamp) to `data/exams.json`.
5. The new exam immediately appears in the list below, and on the public `index.html` page.

Deleting an exam from the Admin list removes both its file and its manifest entry.

## Sharing a link with students

Every exam card (on the public list, or in Admin) has a **Copy link** button — it copies the full URL to `view.html?id=<exam-id>`, which is the page students should open. It shows just that exam (with its name and a copy-link button of its own) without exposing the rest of the site.

## Publishing to GitHub Pages

1. Initialize a git repo here and push it to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root)**.
3. Your site will be live at `https://<your-username>.github.io/<your-repo>/`.
4. To add new exams after that: run the Admin panel locally as above, then commit and push the updated `exams/` and `data/exams.json` files:
   ```bash
   git add exams data
   git commit -m "Add new exam"
   git push
   ```

Because GitHub Pages only serves static files, exams can only be added by running the Admin panel locally and pushing the result — there's no way to add them directly on the live site.

## Note on privacy

If your GitHub repo/Pages site is public, everything in `exams/` and `data/exams.json` is publicly visible to anyone with the link. Don't put sensitive/graded content here unless the repo is private (Pages on a private repo requires GitHub Pro/Team/Enterprise).
