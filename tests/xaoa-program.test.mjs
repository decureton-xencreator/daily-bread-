import test from 'node:test';
import assert from 'node:assert/strict';
import {createXAOAReceipt, evaluateXAOA001} from '../app/xaoa-program.js';

const proof = id => ({passed: true, evidenceId: `evidence-${id}`, checkedAt: '2026-07-23T10:00:00Z'});
const complete = () => ({
  xri: Object.fromEntries(['XRI-006','XRI-007','XRI-008','XRI-009','XRI-010'].map(id => [id, proof(id)])),
  infrastructure: Object.fromEntries(['identity','storage','memory','models','events'].map(id => [id, proof(id)])),
  dailyLoop: Object.fromEntries(['daily_bread','mission_control','command','memory','warden'].map(id => [id, proof(id)])),
  phoneAlpha: {...proof('phone'), installable: true, offlineRecovery: true, touchTargetAudit: true},
  livingCompany: {...proof('company'), companyId: 'company-001', outcomes: [{metricId: 'cycle-time', baseline: 12, result: 8, unit: 'hours'}]},
  drills: Object.fromEntries(['production','failure_recovery','rollback'].map(id => [id, proof(id)])),
  goldMaster: {...proof('gold'), assessmentId: 'XBP-009', decision: 'GOLD_MASTER'},
  generatedAt: '2026-07-23T10:05:00Z'
});

test('starts at XRI-006 and blocks every successor without evidence', () => {
  const result = evaluateXAOA001();
  assert.equal(result.next, 'XRI-006');
  assert.equal(result.orderedGates[0].state, 'BLOCKED_EVIDENCE');
  assert.equal(result.orderedGates[1].state, 'BLOCKED_PREDECESSOR');
});

test('enforces XRI-006 through XRI-010 order', () => {
  const input = complete();
  input.xri['XRI-008'] = {passed: false};
  const result = evaluateXAOA001(input);
  assert.equal(result.next, 'XRI-008');
  assert.equal(result.orderedGates.find(g => g.id === 'XRI-009').state, 'BLOCKED_PREDECESSOR');
});

test('requires all five infrastructure and daily loop bindings', () => {
  const input = complete();
  delete input.infrastructure.events;
  assert.equal(evaluateXAOA001(input).next, 'INFRASTRUCTURE');
  input.infrastructure.events = proof('events');
  delete input.dailyLoop.warden;
  assert.equal(evaluateXAOA001(input).next, 'DAILY_LOOP');
});

test('requires phone recovery, measured company value and all drills', () => {
  const input = complete();
  input.phoneAlpha.offlineRecovery = false;
  assert.equal(evaluateXAOA001(input).next, 'PHONE_ALPHA');
  input.phoneAlpha.offlineRecovery = true;
  input.livingCompany.outcomes = [];
  assert.equal(evaluateXAOA001(input).next, 'LIVING_COMPANY');
  input.livingCompany.outcomes = [{metricId: 'value', baseline: 1, result: 2, unit: 'score'}];
  delete input.drills.rollback;
  assert.equal(evaluateXAOA001(input).next, 'RECOVERY_DRILLS');
});

test('allows Gold Master completion only after XBP-009 evidence', () => {
  const input = complete();
  const result = createXAOAReceipt(input);
  assert.equal(result.state, 'GOLD_MASTER_COMPLETE');
  assert.equal(result.claimAllowed, true);
  assert.equal(result.secretsIncluded, false);
  assert.equal(result.evidenceIds.length, 21);
});
