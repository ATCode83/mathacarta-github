# Contributing

Start with a focused issue describing the problem or proposed improvement. For code changes, fork the repository, create a branch, and submit a pull request explaining the user-visible change and validation.

1. Use Node.js 22 or newer.
2. Run npm test from the repository root.
3. Load extension/ unpacked in Chrome and test the affected webpage and PDF flows.
4. Include relevant tests for behavior changes.
5. Preserve vendor files and their license notices; document deliberate vendor upgrades.

Do not add analytics, credentials, remote executable code, or new external services without discussing the change first. Never load-test public APIs. Use fixtures or mocks for automated network tests.

Original contributions are submitted under this project's MIT license. Third-party contributions must retain their applicable notices. Keep discussion respectful and constructive.
