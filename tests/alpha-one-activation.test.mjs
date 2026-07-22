import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateAlphaOneActivation, verifyAlphaOneActivation} from '../app/alpha-one-activation.js';

const approved = {
  identityProviderId: 'approved-idp',
  serviceEndpoint: 'https://manuals.example.test',
  tenantId: 'tenant-001',
  privacyReviewApproved: true,
  organizationalSourcesApproved: true,
  productionAuthorization: true,
  credential: 'must-never-appear'
};

test('blocks activation when external approvals are absent', () => {
  const result = evaluateAlphaOneActivation({tenantId: 'tenant-001'});
  assert.equal(result.state, 'ACTIVATION_BLOCKED');
  assert.equal(result.approved, false);
});

test('reports credential presence without exposing credential material', () => {
  const result = evaluateAlphaOneActivation(approved);
  assert.equal(result.credentialPresent, true);
  assert.equal(result.credentialValue, null);
  assert.equal(JSON.stringify(result).includes('must-never-appear'), false);
});

test('requires a health check before claiming an active connection', async () => {
  const result = await verifyAlphaOneActivation({config: approved});
  assert.equal(result.state, 'HEALTH_CHECK_REQUIRED');
  assert.equal(result.active, false);
});

test('requires versioned, timestamped health evidence', async () => {
  const result = await verifyAlphaOneActivation({config: approved, healthCheck: async () => ({ok: true})});
  assert.equal(result.state, 'HEALTH_CHECK_FAILED');
  assert.equal(result.active, false);
});

test('certifies only a reachable, approved, evidenced connection', async () => {
  const result = await verifyAlphaOneActivation({config: approved, healthCheck: async ({tenantId}) => ({ok: tenantId === 'tenant-001', serviceVersion: '1.0.0', checkedAt: '2026-07-21T12:00:00Z'})});
  assert.equal(result.state, 'PRODUCTION_CONNECTION_VERIFIED');
  assert.equal(result.active, true);
  assert.deepEqual(result.evidence, {serviceVersion: '1.0.0', checkedAt: '2026-07-21T12:00:00Z'});
});
