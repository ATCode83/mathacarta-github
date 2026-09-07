# Publish on GitHub from VS Code

Suggested repository name: mathacarta
Suggested description: Highlight topics and authors to discover arXiv papers, with an included PDF reader.

## First publication
1. Install Git if VS Code does not detect it, and sign in to GitHub when prompted.
2. Extract this archive and open the mathacarta-github folder in VS Code. README.md and extension/ should be directly inside the opened folder.
3. Open Terminal > New Terminal and run npm test (Node.js 22+ required).
4. Open Source Control and choose Initialize Repository.
5. Review the files, stage them, and commit with the message: Initial open-source release.
6. Choose Publish to GitHub, name the repository mathacarta, and choose Public when ready. Publishing publicly makes the code available under the included MIT license.
7. Open the repository in GitHub and confirm README.md, LICENSE, extension/, tests/, and .github/ are present. The Actions tab should run the test workflow.

If Git asks for an identity, configure your own name and GitHub email (or your GitHub-provided no-reply email). Do not use someone else's credentials.

Do not create a second README or license using GitHub's initialization options. This project already includes both. Do not upload just the ZIP as the repository contents.

## Release download
Run npm run package (Python 3 required as python). After your first push, create a GitHub release with tag v0.10.1 and attach dist/MathaCarta-0.10.1.zip. The tag should point to the commit you tested. GitHub Actions also uploads the built ZIP as a workflow artifact.

The source archive and extension ZIP differ: source includes documentation/tests; extension ZIP puts manifest.json at its root. End users can unzip the extension ZIP and load that folder unpacked.

## Before public announcement
Test automatic searches for a topic and an accented author name, PDF selections, manual mode changes, disabling highlighting, and article links. Refresh tabs after extension updates. Do not claim Chrome Web Store approval or a supported user capacity.

If publishing a store listing later, complete its screenshots, disclosures, support contact, and review. PRIVACY.md can be linked from the public repository or hosted as a page.
