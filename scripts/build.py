"""Package the offline dist contents; never include local release/session files."""
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
version = json.loads((root / 'package.json').read_text())['version']
source = root / 'dist'
assert (source / 'index.html').is_file(), 'Missing dist/index.html'
allowed = {'.html', '.js', '.css', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.woff', '.woff2'}
files = sorted(p for p in source.rglob('*') if p.is_file())
for p in files:
    assert not p.is_symlink(), 'Symlinks are not allowed'
    assert p.suffix.lower() in allowed, 'Unsupported artifact: ' + str(p)
    assert not any(part.startswith('.') for part in p.relative_to(source).parts), 'Hidden file'
output = root / 'build'
output.mkdir(exist_ok=True)
archive = output / ('wonangfei-v' + version + '.zip')
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
    for p in files:
        bundle.write(p, p.relative_to(source).as_posix())
assert archive.stat().st_size <= 10 * 1024 * 1024, 'ZIP exceeds platform limit'
print(archive)
print('Packaging complete; run platform compliance audit and simulator/device validation before release.')
