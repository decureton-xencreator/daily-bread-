const transitions = Object.freeze({
  AUTHORIZED: new Set(['ACTIVE', 'ABORTED']),
  ACTIVE: new Set(['PAUSED', 'COMPLETED', 'ABORTED']),
  PAUSED: new Set(['ACTIVE', 'ABORTED']),
  COMPLETED: new Set(),
  ABORTED: new Set()
});
const iso = value => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(String(value || ''));

export function createPilotLifecycle({activationReceipt, actorId, at} = {}) {
  if (!activationReceipt?.pilotId || activationReceipt.secretsIncluded !== false) throw new Error('valid_activation_receipt_required');
  if (!actorId || !iso(at)) throw new Error('authorized_actor_and_timestamp_required');
  return Object.freeze({schema: 'xen/alpha-one-pilot-lifecycle/v1', pilotId: activationReceipt.pilotId, state: 'AUTHORIZED', sequence: 1,
    events: Object.freeze([Object.freeze({sequence: 1, from: null, to: 'AUTHORIZED', actorId, at, reason: 'activation_receipt_verified', evidenceIds: activationReceipt.approvalEvidenceIds || []})])});
}

export function transitionPilot(lifecycle, {to, actorId, at, reason, evidenceIds = [], outcomes = []} = {}) {
  if (!lifecycle || !transitions[lifecycle.state]?.has(to)) throw new Error('invalid_pilot_transition');
  if (!actorId || !iso(at) || !reason) throw new Error('transition_evidence_required');
  if (to === 'COMPLETED') {
    const valid = outcomes.length > 0 && outcomes.every(item => item.metricId && Number.isFinite(item.baseline) && Number.isFinite(item.result) && item.unit);
    if (!valid) throw new Error('measured_outcomes_required');
  }
  const sequence = lifecycle.sequence + 1;
  const event = Object.freeze({sequence, from: lifecycle.state, to, actorId, at, reason, evidenceIds: Object.freeze([...evidenceIds]), outcomes: Object.freeze(outcomes.map(item => Object.freeze({...item})))});
  return Object.freeze({...lifecycle, state: to, sequence, events: Object.freeze([...lifecycle.events, event])});
}

export function summarizePilot(lifecycle) {
  const completion = lifecycle?.state === 'COMPLETED' ? lifecycle.events.at(-1) : null;
  return Object.freeze({schema: 'xen/alpha-one-pilot-summary/v1', pilotId: lifecycle?.pilotId || null, state: lifecycle?.state || 'UNKNOWN',
    terminal: ['COMPLETED', 'ABORTED'].includes(lifecycle?.state), successClaimAllowed: Boolean(completion?.outcomes?.length),
    outcomeCount: completion?.outcomes?.length || 0, eventCount: lifecycle?.events?.length || 0});
}
