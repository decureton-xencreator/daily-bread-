from __future__ import annotations
import json,re
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];issues=[];warnings=[]
required=['index.html','archive/index.html','data/editions.json','data/current-edition.json','data/academy.json','data/missions.json','data/sources.json','data/releases.json','data/preferences.schema.json','schemas/edition.schema.json','manifest.webmanifest','service-worker.js','assets/css/xdbs.css','assets/css/alive.css','app/app.js','app/alive.js','app/state.js','app/academy.js','app/data.js','app/commands.js','app/saturday-mirror.js','tests/saturday-mirror.test.mjs','app/alpha-one-client.js','app/alpha-one-activation.js','tests/alpha-one-client.test.mjs','tests/alpha-one-activation.test.mjs','app/xaoa-program.js','tests/xaoa-program.test.mjs','config/xaoa-001.activation.json','docs/XAOA-001-XEN-ALPHA-ONE-ACTIVATION-PROGRAM.md','docs/XAO-003-DAILY-BREAD-CONSUMPTION.md','docs/XAO-004-PRODUCTION-ACTIVATION-READINESS.md','releases/XDBS-2.5.0.json','.github/workflows/pages.yml','.nojekyll']
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
 for match in re.finditer(r'<a\b[^>]*\btarget=["\']_blank["\'][^>]*>',h,re.I):
  if 'noopener' not in match.group(0).lower():issues.append(f'unsafe-external-link:{p.relative_to(ROOT)}')
if 'prefers-reduced-motion' not in (ROOT/'assets/css/xdbs.css').read_text():issues.append('reduced-motion:missing')
index=(ROOT/'index.html').read_text()
for series in ['SERIES 02','SERIES 03','SERIES 04','SERIES 05','SERIES 11','SERIES 12','SERIES 13','SERIES 14','SERIES 15','SERIES 18']:
 if series not in index:issues.append(f'missing-ui-marker:{series}')
manifest=json.loads((ROOT/'data/editions.json').read_text())
for e in manifest['editions']:
 if not (ROOT/e['path']).is_file():issues.append(f'archive-missing:{e["path"]}')
current=json.loads((ROOT/'data/current-edition.json').read_text())
if not (ROOT/current['archivePath']).is_file():issues.append(f'current-alias-missing:{current["archivePath"]}')
if not manifest['editions'] or manifest['editions'][0]['path']!=current['archivePath']:issues.append('current-alias-manifest-drift')
releases=json.loads((ROOT/'data/releases.json').read_text())
if releases.get('current')!=current.get('editionVersion'):issues.append('current-release-manifest-drift')
release_path=ROOT/f"releases/XDBS-{current.get('editionVersion')}.json"
if not release_path.is_file():issues.append(f'current-release-missing:{release_path.relative_to(ROOT)}')
secret_pattern=re.compile(r'(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,})')
if re.search(r'\b(?:progress|xp|score|streak):[1-9][0-9]*', (ROOT/'app/data.js').read_text()):issues.append('public-academy-metrics')
for p in ROOT.rglob('*'):
 if p.is_file() and '.git' not in p.parts:
  try:
   if secret_pattern.search(p.read_text(errors='ignore')):issues.append(f'possible-secret:{p.relative_to(ROOT)}')
  except:pass
deployment_verified=False
if release_path.is_file():
 try:deployment_verified=json.loads(release_path.read_text()).get('deployment',{}).get('verified') is True
 except Exception:pass
warnings=['Calendar details are intentionally withheld; route, biometric and cross-device Academy integrations are not connected','Visual cross-browser verification remains a manual acceptance item']
if not deployment_verified:warnings.insert(1,'Production deployment requires post-commit workflow and endpoint verification')
report={'schemaVersion':'2.5','validatedAt':'2026-07-23T05:00:00-04:00','result':'PASS' if not issues else 'FAIL','checks':{'requiredFiles':not any(x.startswith('missing:') for x in issues),'jsonParse':not any(x.startswith('invalid-json') for x in issues),'internalLinks':not any(x.startswith('broken-link') for x in issues),'safeExternalLinks':not any(x.startswith('unsafe-external-link') for x in issues),'controls':not any(x.startswith('empty-button') for x in issues),'responsiveViewport':not any(x.startswith('viewport') for x in issues),'reducedMotion':'reduced-motion:missing' not in issues,'archiveIntegrity':not any(x.startswith(('archive-missing','current-alias','current-release')) for x in issues),'academyPublicMetrics':'public-academy-metrics' not in issues,'secretScan':not any(x.startswith('possible-secret') for x in issues),'deploymentEvidence':deployment_verified},'issues':issues,'warnings':warnings}
(ROOT/'reports').mkdir(exist_ok=True);(ROOT/'reports/validation-report.json').write_text(json.dumps(report,indent=2)+'\n')
if issues:raise SystemExit('XDBS validation failed:\n'+'\n'.join(issues))
print('XDBS 2.5 validation passed')
