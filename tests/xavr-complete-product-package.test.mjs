import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('governance/XAVR-1.0-XCP-MANIFEST.json', 'utf8'));
const evidence = JSON.parse(fs.readFileSync('governance/XAVR-1.0-DEVICE-EVIDENCE-2026-07-25.json', 'utf8'));
const required = [
  'product_definition', 'design_canon', 'operating_manual', 'tutorial_onboarding',
  'publication_suite', 'pdf_edition', 'voice_experience', 'accessibility_language',
  'privacy_safety_governance', 'functional_build', 'validation_evidence', 'release_lifecycle'
];

assert.equal(manifest.schema, 'xen/xcp-complete-product-package/v1');
assert.deepEqual(Object.keys(manifest.components), required);
for (const [name, component] of Object.entries(manifest.components)) {
  assert.notEqual(component.state, 'PLANNED', `${name} remains planned`);
  assert.ok(component.artifacts.length, `${name} requires an artifact`);
  assert.ok(component.evidence.length, `${name} requires evidence`);
  for (const artifact of component.artifacts) assert.ok(fs.existsSync(artifact), `${artifact} must exist`);
}
assert.equal(evidence.evidence_class, 'USER_REPORTED_PHYSICAL_DEVICE');
assert.equal(evidence.verified.production_assessment_completed, true);
assert.ok(evidence.not_separately_reported.includes('deny-permission recovery'));
assert.equal(manifest.warden.result, 'BLOCKED_DEVICE_MATRIX');

for (const path of [
  'docs/XAVR-1.0-OPERATING-MANUAL.md',
  'docs/XAVR-1.0-DESIGN-CANON.md',
  'docs/XAVR-1.0-PUBLICATION.md',
  'docs/XAVR-1.0-VOICE-SCRIPT.md'
]) {
  const text = fs.readFileSync(path, 'utf8');
  assert.ok(text.length > 300, `${path} is unexpectedly shallow`);
}

console.log('XAVR complete product package and honest device evidence boundary: PASS');
