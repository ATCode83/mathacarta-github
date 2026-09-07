from pathlib import Path
import json
import zipfile

root = Path(__file__).resolve().parents[1]
extension = root / "extension"
manifest = json.loads((extension / "manifest.json").read_text())
out = root / "dist"
out.mkdir(exist_ok=True)
target = out / ("MathaCarta-" + manifest["version"] + ".zip")
with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(extension.rglob("*")):
        if path.is_file():
            archive.write(path, path.relative_to(extension))
    for name in ["LICENSE", "NOTICE.md"]:
        archive.write(root / name, name)
with zipfile.ZipFile(target) as archive:
    assert "manifest.json" in archive.namelist()
    assert "vendor/pdfjs/LICENSE" in archive.namelist()
    assert archive.testzip() is None
print(target)
