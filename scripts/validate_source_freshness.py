from __future__ import annotations
import argparse,json
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def parse(value:str)->datetime:
 return datetime.fromisoformat(value.replace('Z','+00:00')).astimezone(timezone.utc)
def main()->int:
 p=argparse.ArgumentParser();p.add_argument('--root',type=Path,default=ROOT);p.add_argument('--max-age-hours',type=float,default=36);p.add_argument('--now');a=p.parse_args()
 root=a.root.resolve();issues=[]
 sources=json.loads((root/'data/sources.json').read_text())
 releases=json.loads((root/'data/releases.json').read_text())
 release=json.loads((root/f"releases/XDBS-{releases['current']}.json").read_text())
 now=parse(a.now) if a.now else datetime.now(timezone.utc)
 stamps=[sources.get('publishedAt')]+[s.get('retrievedAt') for s in sources.get('sources',[]) if s.get('type')=='timestamped-external-retrieval']
 for stamp in filter(None,stamps):
  age=(now-parse(stamp)).total_seconds()/3600
  if age<0:issues.append(f'future-timestamp:{stamp}')
  elif age>a.max_age_hours:issues.append(f'stale:{stamp}:{age:.1f}h')
 urls=release.get('freshSources',[])
 if not urls:issues.append('missing:freshSources')
 if any(not u.startswith('https://') for u in urls):issues.append('invalid-source-url')
 external=set(sources.get('externalLiveFeeds',[]))
 if not {'weather','markets','world-intelligence','sports'}.issubset(external):issues.append('missing-live-feed-classification')
 report={'schemaVersion':'1.0','checkedAt':now.isoformat(),'maxAgeHours':a.max_age_hours,'result':'PASS' if not issues else 'STALE','sourceCount':len(urls),'issues':issues}
 print(json.dumps(report,indent=2));return 0 if not issues else 1
if __name__=='__main__':raise SystemExit(main())
