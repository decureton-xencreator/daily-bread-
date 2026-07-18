from __future__ import annotations
import argparse,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--date',required=True);p.add_argument('--title',required=True);a=p.parse_args()
year,month,_=a.date.split('-');path=f'editions/{year}/{month}/daily-bread-{a.date}.html';target=ROOT/path
if not target.is_file():raise SystemExit(f'Prepared edition missing: {path}')
m_path=ROOT/'data/editions.json';m=json.loads(m_path.read_text());m['editions']=[e for e in m['editions'] if e['date']!=a.date];m['editions'].insert(0,{'date':a.date,'title':a.title,'summary':'Published XDBS edition.','path':path,'mode':'declared','tags':[],'status':'published','version':'2.0.0'});m['updated_at']=a.date+'T06:00:00-04:00';m_path.write_text(json.dumps(m,indent=2)+'\n');print(path)
