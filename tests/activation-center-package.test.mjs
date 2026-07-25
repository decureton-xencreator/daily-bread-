import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync('governance/XAO-009-XCP-MANIFEST.json','utf8'));
assert.equal(Object.keys(manifest.components).length,12);
assert.equal(manifest.components.pdf_edition.state,'VALIDATED');
for(const component of Object.values(manifest.components)){
  assert.equal(component.exception,null);
  for(const path of component.artifacts)assert.equal(fs.existsSync(path),true,`missing ${path}`);
}
const pdf=fs.readFileSync('output/pdf/XAO-009-ACTIVATION-CENTER-MANUAL.pdf');
const hash=crypto.createHash('sha256').update(pdf).digest('hex');
assert.ok(manifest.components.pdf_edition.evidence.some(item=>item.includes(hash)));
console.log('XAO-009 complete product package: PASS');
