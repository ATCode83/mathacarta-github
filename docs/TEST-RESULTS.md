# MathaCarta 0.10.1 validation

13 automated Node tests pass, covering query escaping, author routing including accented names, safe links, popup positioning, background selection handling, cached responses, failed requests, cooldown enforcement and cached access during cooldown. Reference-check messages are no longer handled.

The manifest no longer loads graph/reference scripts or grants Crossref access. Both webpage and PDF reader use the same automatic search card (650 ms selection delay).

These tests do not constitute a live Chrome/PDF integration test or a load test. Complete the manual checks in START-HERE.md before public rollout.
