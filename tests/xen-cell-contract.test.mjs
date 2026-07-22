import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const cell=JSON.parse(fs.readFileSync(new URL('../config/xen-cell.daily-bread-alpha1.json',import.meta.url)));
test('Daily Bread is a fully declared Xen cell',()=>{assert.equal(cell.cell_id,'daily-bread-alpha1');assert.equal(cell.inheritance.guardian,'deny-by-default');assert.equal(cell.inheritance.warden,'fail-closed-authority');assert.match(cell.repair_source,/immutable/);assert.deepEqual(cell.probes,['availability','error-budget','latency','privacy','cost'])});
test('live activation remains truthful',()=>assert.equal(cell.activation_state,'EXTERNAL_INPUTS_PENDING'));
