# AI Agent Guidance

## Project summary
- Single-page static bill generator app.
- Uses Tailwind CSS, Alpine.js, jsPDF, and jsPDF AutoTable via CDN.
- No package manager, build step, or test framework present.
- Deployable as a static Netlify site.

## Project structure
- `index.html`: entry point and HTML template.
- `src/css/styles.css`: site styling and preview layout.
- `src/js/config.js`: brand configuration, default form values, label text, and layout settings.
- `src/js/utils.js`: shared formatting helpers and PDF generation logic.
- `src/js/app.js`: Alpine.js application state and UI actions.
- `src/assets/logo.png`: vendor logo asset.

## Development notes
- Keep changes focused on plain HTML/CSS/JS.
- Preserve the static site model and CDN dependencies unless a new build system is explicitly added.
- Maintain Alpine.js reactive data bindings for the editor and preview.
- Keep `config.js` as the source of branding and default values.
- Keep `utils.js` for reusable helpers, including date formatting and PDF export.

## How to validate changes
- Open `index.html` in a browser.
- Edit customer details, address, date, and item rows.
- Verify the right-side preview updates automatically.
- Click `GENERATE PDF BILL` and confirm the downloaded PDF matches the preview.
