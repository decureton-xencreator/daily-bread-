import test from 'node:test';
import assert from 'node:assert/strict';
import {createPilotActivationReceipt, evaluatePilotReadiness} from '../app/alpha-one-pilot-readiness.js';

const at = '2026-07-21T16:00:00Z';
const approval = (type, id) => ({type, id, approvedBy: 'authorized-owner', approvedAt: at});
const complete = {
  pilotId: 'pilot-fictional-001',
  evaluatedAt: at,
  executiveSponsor: approval('executive_sponsor', 'sponsor-approval-001'),
  tenantBoundary: {id: 'tenant-evidence-001', tenantId: 'tenant-fictional', dataRegion: 'approved-region', isolationVerified: true, verifiedAt: at},
  privacyApproval: approval('privacy_approval', 'privacy-001'),
  approvedSources: [{id: 'manual-fictional', version: '1.0.0', approved: true, approvedBy: 'source-owner', approvedAt: at}],
  baselineMetrics: [{id: 'metric-onboarding-time', name: 'Onboarding time', value: 20, unit: 'hours', measuredAt: at}],
  commercialTerms: approval('commercial_terms', 'terms-001'),
  identityEvidence: approval('identity_evidence', 'identity-001'),
  serviceHealth: {id: 'health-001', state: 'PRODUCTION_CONNECTION_VERIFIED', serviceVersion: '1.0.0', checkedAt: at},
  acceptanceOwner: approval('acceptance_owner', 'acceptance-001')
};

test('fails closed and names every missing pilot gate', () => {
  const result = evaluatePilotReadiness({evaluatedAt: at});
  assert.equal(result.state, 'PILOT_BLOCKED');
  assert.equal(result.missing.length, 10);
  assert.equal(result.credentialMaterial, null);
});

test('does not accept unversioned or unapproved sources', () => {
  const result = evaluatePilotReadiness({...complete, approvedSources: [{id: 'manual-fictional', approved: true}]});
  assert.equal(result.ready, false);
  assert.ok(result.missing.includes('source_registry'));
});

test('requires a pilot identifier and timestamp before authorization', () => {
  const result = evaluatePilotReadiness({...complete, pilotId: '', evaluatedAt: ''});
  assert.equal(result.ready, false);
  assert.ok(result.missing.includes('pilot_identity'));
});

test('requires measurable timestamped baselines', () => {
  const result = evaluatePilotReadiness({...complete, baselineMetrics: [{id: 'metric', name: 'Training', value: 'unknown'}]});
  assert.equal(result.ready, false);
  assert.ok(result.missing.includes('baseline_metrics'));
});

test('authorizes only a complete evidence package', () => {
  const result = evaluatePilotReadiness(complete);
  assert.equal(result.state, 'PILOT_AUTHORIZED');
  assert.equal(result.ready, true);
  assert.deepEqual(result.missing, []);
});

test('creates an audit-safe activation receipt without approval payloads or secrets', () => {
  const result = createPilotActivationReceipt({...complete, credential: 'never-export-this'});
  assert.equal(result.receipt.pilotId, 'pilot-fictional-001');
  assert.deepEqual(result.receipt.sourceVersions, ['manual-fictional@1.0.0']);
  assert.equal(result.receipt.secretsIncluded, false);
  assert.equal(JSON.stringify(result).includes('never-export-this'), false);
});

test('refuses to create a receipt for an incomplete package', () => {
  const result = createPilotActivationReceipt({...complete, commercialTerms: null});
  assert.equal(result.state, 'PILOT_BLOCKED');
  assert.equal(result.receipt, null);
});
