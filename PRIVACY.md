# MathaCarta privacy notice

Applies to version 0.10.1.

MathaCarta has no account system, analytics, developer-operated backend, or AI service.

## Searches
With automatic highlighting enabled, selecting 3–500 characters on a supported webpage or in the included PDF reader sends the normalized selection to arXiv after a short pause. Manual searches also send the query to arXiv. Opening an arXiv search or article link contacts arXiv directly. arXiv receives ordinary network information, including your IP address, and handles requests under its own policies.

Editable fields are skipped. You can disable automatic highlighting in the toolbar panel. Avoid selecting confidential text while this feature is enabled.

## Device storage
Up to 20 arXiv responses are cached locally and reused for 24 hours; older entries may remain stored until replaced or cleared. A selection sent to the side panel stays in browser-session storage. Preferences and request cooldown timestamps are stored locally. Clear local data removes cached responses and the side-panel selection, while preferences and cooldown settings remain. Uninstalling removes extension storage.

## PDFs
Local PDFs are processed on your device. Opening an online PDF contacts its host, with optional host permission where required. Searching selected PDF text sends that query to arXiv, not the entire PDF.

## Permissions
- contextMenus: selection search and opening PDFs.
- sidePanel: the toolbar panel.
- storage: preferences, cache, selection, and cooldown.
- tabs: obtain the active tab's address for the PDF-reader action.
- export.arxiv.org access: search API requests.
- Optional HTTP/HTTPS host access: fetch a PDF from a user-chosen host.
- HTTP/HTTPS content scripts: observe eligible selections and render the card.

## Questions
Use the repository's Issues tab for non-sensitive privacy questions. Do not include confidential documents, passwords, or private search text.
