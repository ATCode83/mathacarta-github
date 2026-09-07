# How the code works

## Selection and popup
highlight.js observes selection gestures, skips editable fields, and waits 650 ms before opening a card and requesting a search. popup-core.js provides name detection, safe article URL handling, feed parsing, and viewport positioning. A serial number prevents older responses from replacing newer selections.

## Search service
background.js receives SEARCH_ARXIV messages and serializes work within one installation. core.js builds the arXiv query. Cached results bypass the network; uncached calls wait for the request-spacing rule. Busy responses start a persistent cooldown. Successful feeds return to the interface for parsing and display.

## Toolbar panel
panel.html, panel.css, and panel.js provide manual search, the automatic-highlight toggle, local data clearing, and PDF actions. Context-menu selections arrive through session storage.

## PDF reader
reader.html, reader.css, and reader.js use bundled PDF.js to render one page and its selectable text layer. The same highlight.js handles selections there. Remote PDFs require host access; local files are read from the file picker.

## Boundaries
There is no hosted backend or AI. Tests use simulated Chrome APIs for service behavior. The automated suite does not establish live-browser integration, PDF compatibility, or provider-approved throughput.
