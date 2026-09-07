# MathaCarta 0.10.1 — arXiv Explorer

## Install or update in Chrome
1. Extract this ZIP to a permanent folder.
2. Open chrome://extensions and enable Developer mode.
3. For a new installation, click Load unpacked and select the extension folder.
4. To update an existing installation, replace the contents of its extension folder with these files, then click Reload on its card.
5. Reload existing webpages and close/reopen any MathaCarta PDF-reader tabs.

Highlight a topic or author (3–500 characters). A card appears and automatically searches after a 650 ms pause. Choose Author or Theorem / topic if necessary; changing the mode starts a new search. Disable automatic searching in the toolbar panel when needed. The card shows the count and up to ten article links with authors. Each normal uncached search uses one arXiv API request. There is no graph or reference checker.

Click the toolbar icon for manual search and PDF-reader controls. Right-click a PDF link or PDF page and select Open in MathaCarta PDF reader. If access is needed, click Open URL in the reader to grant it. Local PDFs can be selected using Open local PDF. Chrome's built-in PDF viewer does not support this highlight card; use the included reader. Scanned PDFs without a text layer are not supported.

## Before public release
Test author and topic searches on a webpage and a selectable-text PDF. Confirm highlighting automatically loads results, links open correctly, and unavailable searches show an error. Author detection is a heuristic; users can change the mode. Shared author names can return multiple people. Counts describe query matches, not verified full-text mentions.

The extension serializes API requests per installation, spaces them by at least 3.1 seconds, and caches up to 20 responses for 24 hours. HTTP 429/503 starts an increasing cooldown (at least 30 seconds, honoring Retry-After); users retry after the pause. This does not establish a separate arXiv allowance per installation or guarantee high-volume access.

## Chrome Web Store submission
This package is not published or approved by Google. For upload, ZIP the contents of extension so manifest.json is at the ZIP root. Supply your store description, screenshots, support contact and hosted privacy policy. Review PRIVACY.md against your final release and complete the store's disclosures.

## Privacy
See ../PRIVACY.md for the current notice.

## Tests
Run node --test tests/*.test.js from the repository root.
