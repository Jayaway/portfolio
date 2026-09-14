"""Export only public website files for Vercel or static hosting."""
from pathlib import Path
import shutil
import json

root = Path(__file__).resolve().parent.parent
output = root / 'dist'
if output.exists():
    shutil.rmtree(output)
output.mkdir()
shutil.copy2(root / 'index.html', output / 'index.html')
for name in ('css', 'js', 'images', 'data', 'media'):
    if (root / name).exists():
        shutil.copytree(root / name, output / name)
json.loads((output / 'data/site.json').read_text())
print(f'Public website exported to {output}')
