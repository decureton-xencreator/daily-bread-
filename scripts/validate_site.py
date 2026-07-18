from __future__ import annotations
import json,re
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];issues=[];warnings=[]
required=['index.html','archive/index.html','data/editions.json','data/current-edition.json','data/academy.json','data/missions.json','data/sources.json','data/releases.json','data/preferences.schema.json','schemas/edition.schema.json','manifest.webmanifest','service-worker.js','assets/css/xdbs.css','app/app.js','app/state.js','app/data.js','app/commands.js','releases/XDBS-2.0.0.json','.github/workflows/pages.yml','.nojekyll']
for p in required:
 if not (ROOT/p).is_file():issues.append(f'missing:{p}')
for p in ROOT.rglob('*.json'):
 try:json.loads(p.read_text())
 except Exception as e:issues.append(f'invalid-json:{p.relative_to(ROOT)}:{e}')
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.buttons=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag in ('a','link','script'):self.links.append(a.get('href') or a.get('src'))
  if tag=='button':self.buttons.append(a)
for p in ROOT.rglob('*.html'):
 h=p.read_text();lo=h.lower()
 if 'name="viewport"' not in lo:issues.append(f'viewport:{p.relative_to(ROOT)}')
 if '<html lang=' not in lo:issues.append(f'lang:{p.relative_to(ROOT)}')
 parser=Links();parser.feed(h)
 for raw in filter(None,parser.links):
  if raw.startswith(('http:','https:','mailto:','#','data:')):continue
  clean=raw.split('#')[0].split('?')[0]
  if clean and not (p.parent/clean).resolve().exists():issues.append(f'broken-link:{p.relative_to(ROOT)}->{raw}')
 for b in parser.buttons:
  if not any(k in b for k in ('data-action','data-complete','data-course','data-filter','data-region','data-save','data-dismiss','data-command','type')):issues.append(f'empty-button:{p.relative_to(ROOT)}')
if 'prefers-reduced-motion' not in (ROOT/'assets/css/xdbs.css').read_text():issues.append('reduced-motion:missing')
index=(ROOT/'index.html').read_text()
for series in ['SERIES 02','SERIES 03','SERIES 04','SERIES 05','SERIES 11','SERIES 12','SERIES 13','SERIES 14','SERIES 15','SERIES 18']:
 if series not in index:issues.append(f'missing-ui-marker:{series}')
manifest=json.loads((ROOT/'data/editions.json').read_text())
for e in manifest['editions']:
 if not (ROOT/e['path']).is_file():issues.append(f'archive-missing:{e["path"]}')
secret_pattern=re.compile(r'(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,})')
for p in ROOT.rglob('*'):
 if p.is_file() and '.git' not in p.parts:
  try:
   if secret_pattern.search(p.read_text(errors='ignore')):issues.append(f'possible-secret:{p.relative_to(ROOT)}')
  except:pass
report={'schemaVersion':'2.0','validatedAt':'2026-07-17T23:00:00-04:00','result':'PASS' if not issues else 'FAIL','checks':{'requiredFiles':not any(x.startswith('missing:') for x in issues),'jsonParse':not any(x.startswith('invalid-json') for x in issues),'internalLinks':not any(x.startswith('broken-link') for x in issues),'controls':not any(x.startswith('empty-button') for x in issues),'responsiveViewport':not any(x.startswith('viewport') for x in issues),'reducedMotion':'reduced-motion:missing' not in issues,'archiveIntegrity':not any(x.startswith('archive-missing') for x in issues),'secretScan':not any(x.startswith('possible-secret') for x in issues)},'issues':issues,'warnings':['Live external integrations not connected','Visual cross-browser verification required after deployment']}
(ROOT/'reports').mkdir(exist_ok=True);(ROOT/'reports/validation-report.json').write_text(json.dumps(report,indent=2)+'\n')
if issues:raise SystemExit('XDBS validation failed:\n'+'\n'.join(issues))
print('XDBS 2.0 validation passed')
