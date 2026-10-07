# Lädt den aktuellen Stand der Seite auf GitHub hoch.
# Aufruf im Ordner der Webseite:  python veroeffentlichen.py "Was geändert wurde"
#
# Vor dem Hochladen bekommen Stylesheet und Skripte in allen HTML-Seiten eine neue
# Versionsnummer (?v=...). Dadurch holt jeder Browser nach einer Änderung sofort die
# neuen Dateien, statt bis zu zehn Minuten die alten aus dem Zwischenspeicher zu zeigen.
import glob
import re
import subprocess
import sys
import time

meldung = sys.argv[1] if len(sys.argv) > 1 else 'Aktualisierung'
version = time.strftime('%Y%m%d%H%M%S')

for datei in glob.glob('*.html'):
    text = open(datei, encoding='utf-8').read()
    neu = re.sub(r'((?:css|js)/[\w.-]+\.(?:css|js))(?:\?v=\d+)?', r'\1?v=' + version, text)
    if neu != text:
        open(datei, 'w', encoding='utf-8', newline='\n').write(neu)

subprocess.run(['git', 'add', '-A'], check=True)
if subprocess.run(['git', 'diff', '--cached', '--quiet']).returncode == 0:
    print('Nichts zu veröffentlichen.')
    sys.exit(0)
subprocess.run(['git', 'commit', '-q', '-m', meldung + '\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'], check=True)
subprocess.run(['git', 'push', '-q'], check=True)
print('Hochgeladen, Version', version)
