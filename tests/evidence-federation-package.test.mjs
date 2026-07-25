import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync('governance/XAO-010-XCP-MANIFEST.json','utf8'));
assert.equal(Object.keys(manifest.components).length,12);
for(const component of Object.values(manifest.components)){
  assert.equal(component.exception,null);
  for(const path of component.artifacts)assert.equal(fs.existsSync(path),true,`missing ${path}`);
}
assert.equal(manifest.components.pdf_edition.state,'VALIDATED');
const pdf=fs.readFileSync('output/pdf/XAO-010-EVIDENCE-FEDERATION-MANUAL.pdf');
const hash=crypto.createHash('sha256').update(pdf).digest('hex');
assert.ok(manifest.components.pdf_edition.evidence.some(item=>item.includes(hash)));
const receipt=JSON.parse(fs.readFileSync('data/xri-evidence-federation.json','utf8'));
assert.equal(receipt.decision.passed,false);
assert.equal(receipt.decision.code,'IDENTIFIER_COLLISION_CONTRACT_MISMATCH');
assert.equal(receipt.privacy.secretsIncluded,false);
console.log('XAO-010 complete product package: PASS');
