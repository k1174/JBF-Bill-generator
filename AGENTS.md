# AI Agent Guidance

## Project summary
- Single-page static bill generator app.
- Main source is `index.html`.
- Uses Tailwind CSS via CDN and jsPDF/jsPDF AutoTable for PDF export.
- No package manager, build step, or test framework present.

## Key file
- `index.html`: contains the full UI, styling, and JavaScript logic.
  - The left panel is the bill editor.
  - The right panel is the live preview.
  - PDF export is implemented entirely in the inline `<script>`.

## Development notes
- Keep changes focused on plain HTML/CSS/JS.
- Do not assume a Node.js/npm project unless new files are added that introduce one.
- If splitting code, preserve the current behavior: live preview updates and PDF generation should continue to work.
- The app is intended to run by opening `index.html` in a browser.

## How to validate changes
- Open `index.html` in a browser.
- Edit customer details and item rows.
- Verify preview updates correctly.
- Click `GENERATE PDF BILL` and confirm the downloaded PDF matches the preview.
