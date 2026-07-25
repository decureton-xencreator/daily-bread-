import assert from 'node:assert/strict';
import fs from 'node:fs';
const manifest=JSON.parse(fs.readFileSync('governance/XQG-1.0-XCP-MANIFEST.json','utf8'));
assert.equal(manifest.schema,'xen/xcp-complete-product-package/v1');
assert.equal(Object.keys(manifest.components).length,12);
for(const [name,component] of Object.entries(manifest.components)){
  assert.notEqual(component.state,'PLANNED',`${name} remains planned`);
  assert.ok(component.artifacts.length);
  for(const artifact of component.artifacts)assert.ok(fs.existsSync(artifact),`${artifact} missing`);
}
assert.equal(manifest.warden.result,'PRODUCTION_VERIFIED');
assert.equal(manifest.warden.production_commit,'a8a453bd233dba5aa0c6396b6d883ade976c63a0');
console.log('XQG complete product package: PASS');
