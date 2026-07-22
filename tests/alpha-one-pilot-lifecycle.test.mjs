import test from 'node:test';
import assert from 'node:assert/strict';
import {createPilotLifecycle, summarizePilot, transitionPilot} from '../app/alpha-one-pilot-lifecycle.js';

const at = '2026-07-21T17:00:00Z';
const receipt = {pilotId: 'pilot-fictional-001', secretsIncluded: false, approvalEvidenceIds: ['approval-1']};
const start = () => createPilotLifecycle({activationReceipt: receipt, actorId: 'owner', at});

test('requires an audit-safe activation receipt', () => {
  assert.throws(() => createPilotLifecycle({activationReceipt: {...receipt, secretsIncluded: true}, actorId: 'owner', at}), /valid_activation_receipt_required/);
});
test('preserves an append-only sequence through pause and recovery', () => {
  let pilot = transitionPilot(start(), {to: 'ACTIVE', actorId: 'owner', at, reason: 'pilot_started'});
  pilot = transitionPilot(pilot, {to: 'PAUSED', actorId: 'owner', at, reason: 'service_review'});
  pilot = transitionPilot(pilot, {to: 'ACTIVE', actorId: 'owner', at, reason: 'service_recovered', evidenceIds: ['health-2']});
  assert.deepEqual(pilot.events.map(event => event.sequence), [1, 2, 3, 4]);
});
test('rejects illegal transitions and unevidenced changes', () => {
  assert.throws(() => transitionPilot(start(), {to: 'COMPLETED', actorId: 'owner', at, reason: 'skip'}), /invalid_pilot_transition/);
  assert.throws(() => transitionPilot(start(), {to: 'ACTIVE', actorId: '', at, reason: 'start'}), /transition_evidence_required/);
});
test('blocks completion and success claims without measured outcomes', () => {
  const pilot = transitionPilot(start(), {to: 'ACTIVE', actorId: 'owner', at, reason: 'pilot_started'});
  assert.throws(() => transitionPilot(pilot, {to: 'COMPLETED', actorId: 'owner', at, reason: 'done'}), /measured_outcomes_required/);
  assert.equal(summarizePilot(pilot).successClaimAllowed, false);
});
test('permits a completion claim only with baseline and result evidence', () => {
  let pilot = transitionPilot(start(), {to: 'ACTIVE', actorId: 'owner', at, reason: 'pilot_started'});
  pilot = transitionPilot(pilot, {to: 'COMPLETED', actorId: 'owner', at, reason: 'accepted', evidenceIds: ['acceptance-1'], outcomes: [{metricId: 'onboarding-time', baseline: 20, result: 14, unit: 'hours'}]});
  assert.equal(summarizePilot(pilot).successClaimAllowed, true);
});
test('supports a governed abort without mislabeling it success', () => {
  const pilot = transitionPilot(start(), {to: 'ABORTED', actorId: 'owner', at, reason: 'authorization_withdrawn'});
  assert.deepEqual(summarizePilot(pilot), {schema: 'xen/alpha-one-pilot-summary/v1', pilotId: 'pilot-fictional-001', state: 'ABORTED', terminal: true, successClaimAllowed: false, outcomeCount: 0, eventCount: 2});
});
