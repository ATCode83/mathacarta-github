# MathaCarta

Highlight an author or topic. Discover related arXiv papers without leaving your reading workflow.

MathaCarta is an experimental Chrome extension by Avery Carr. It automatically displays an article count and up to ten linked results after you highlight text on a webpage or in its included PDF reader. No AI service or account is required.

## Features
- Floating search card after a short selection pause.
- Author-field or title/abstract search, with a manual mode selector.
- Article links and author names.
- Local and remote PDF reading using bundled PDF.js.
- Right-click a PDF page or link to open the included reader.
- Local response caching, sequential requests, and cooldowns for busy responses.
- A toolbar panel for manual searches and disabling automatic highlighting.

This release has no yearly graph, reference checker, or Mathlib checks.

## Install locally
1. Download and extract the source, or clone this repository.
2. Open chrome://extensions in Chrome 145 or newer.
3. Enable Developer mode and choose **Load unpacked**.
4. Select this project's **extension** directory.
5. Refresh any webpages already open.
6. Highlight a topic or name. The card automatically searches after about 650 ms.

A Chrome Web Store listing is not included in this repository. Other browsers have not been validated.

For PDFs, right-click a PDF link and choose **Open in MathaCarta PDF reader**, or use the toolbar panel. Grant access to the PDF host if prompted. Local PDFs can be selected directly. Highlighting inside Chrome's built-in PDF viewer is not supported. Scanned pages without selectable text require OCR, which is not included.

## Accuracy and privacy
Counts describe arXiv query matches, not verified mentions throughout full papers. Author-name detection is heuristic; select the correct mode when needed. People with the same name may share results.

When enabled, automatic highlighting sends the selected phrase to arXiv. Editable fields are skipped. Disable automatic highlighting using the toolbar panel. See [PRIVACY.md](PRIVACY.md) for data handling and permissions.

## Development
The application uses JavaScript, HTML, CSS, and a Manifest V3 JSON configuration. No build step or npm dependencies are needed. Use Node.js 22 or newer for tests and packaging.

Run from the repository root:

```sh
npm test
npm run package
```

The packaging script uses Python 3 (available as python on your PATH). It produces dist/MathaCarta-0.10.1.zip with manifest.json at the root, plus original and third-party license notices. That ZIP can be used for a store submission; submission and approval are separate steps.

## Project layout

| Path | Purpose |
|---|---|
| extension/manifest.json | Chrome entry points and permissions |
| extension/background.js | arXiv requests, cache, queue, cooldown, right-click menus |
| extension/highlight.js | Selection events and floating result card |
| extension/core.js and popup-core.js | Query, author detection, feed and positioning helpers |
| extension/panel.* | Toolbar side-panel interface |
| extension/reader.* | PDF reader interface and rendering |
| extension/vendor/pdfjs/ | Bundled PDF.js and supporting asset licenses |
| tests/ | Node automated tests |
| scripts/package.py | Reproducible release ZIP layout |
| docs/ | Installation, publishing, architecture, and validation notes |
| .github/ | Test workflow and contribution templates |

## API usage and scaling
Each uncached normal search makes one arXiv API call. This installation spaces requests by at least 3.1 seconds and caches up to 20 results for 24 hours. HTTP 429/503 causes a cooldown; users can retry afterward. These mechanisms are per installation, not coordinated across all users.

arXiv's [API terms](https://info.arxiv.org/help/api/tou.html) specify one request every three seconds and a single connection, collectively across machines under your control. Independent extension distribution needs clarification before assuming separate allowances. High-volume adoption requires planning with the data provider; this project has no guaranteed user capacity.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports and focused pull requests are welcome. Please describe your browser version and reproduction steps, and remove personal or confidential information.

## License
Original MathaCarta code is under the [MIT License](LICENSE), copyright 2026 Avery Carr. Commercial reuse is permitted subject to its terms. Bundled third-party files retain their own licenses; see [NOTICE.md](NOTICE.md).

MathaCarta is an independent project, not endorsed by arXiv or Mozilla.
