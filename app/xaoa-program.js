const ORDER = Object.freeze([
  'XRI-006', 'XRI-007', 'XRI-008', 'XRI-009', 'XRI-010',
  'INFRASTRUCTURE', 'DAILY_LOOP', 'PHONE_ALPHA', 'LIVING_COMPANY',
  'RECOVERY_DRILLS', 'XBP-009'
]);

const REQUIRED_INFRASTRUCTURE = Object.freeze(['identity', 'storage', 'memory', 'models', 'events']);
const REQUIRED_LOOP = Object.freeze(['daily_bread', 'mission_control', 'command', 'memory', 'warden']);
const REQUIRED_DRILLS = Object.freeze(['production', 'failure_recovery', 'rollback']);
const present = value => typeof value === 'string' && value.trim().length > 0;
const evidenced = item => item?.passed === true && present(item.evidenceId) && present(item.checkedAt);

export function evaluateXAOA001(input = {}) {
  const xri = Object.fromEntries(ORDER.slice(0, 5).map(id => [id, evidenced(input.xri?.[id])]));
  const infrastructure = Object.fromEntries(REQUIRED_INFRASTRUCTURE.map(id => [id, evidenced(input.infrastructure?.[id])]));
  const loop = Object.fromEntries(REQUIRED_LOOP.map(id => [id, evidenced(input.dailyLoop?.[id])]));
  const phone = evidenced(input.phoneAlpha)
    && input.phoneAlpha?.installable === true
    && input.phoneAlpha?.offlineRecovery === true
    && input.phoneAlpha?.touchTargetAudit === true;
  const company = evidenced(input.livingCompany)
    && present(input.livingCompany?.companyId)
    && Array.isArray(input.livingCompany?.outcomes)
    && input.livingCompany.outcomes.some(outcome => present(outcome.metricId)
      && Number.isFinite(outcome.baseline) && Number.isFinite(outcome.result));
  const drills = Object.fromEntries(REQUIRED_DRILLS.map(id => [id, evidenced(input.drills?.[id])]));
  const goldMaster = evidenced(input.goldMaster)
    && input.goldMaster?.assessmentId === 'XBP-009'
    && input.goldMaster?.decision === 'GOLD_MASTER';

  const gates = {
    ...xri,
    INFRASTRUCTURE: Object.values(infrastructure).every(Boolean),
    DAILY_LOOP: Object.values(loop).every(Boolean),
    PHONE_ALPHA: phone,
    LIVING_COMPANY: company,
    RECOVERY_DRILLS: Object.values(drills).every(Boolean),
    'XBP-009': goldMaster
  };
  let predecessorPassed = true;
  const orderedGates = ORDER.map(id => {
    const passed = predecessorPassed && gates[id] === true;
    const state = passed ? 'PASS' : predecessorPassed ? 'BLOCKED_EVIDENCE' : 'BLOCKED_PREDECESSOR';
    predecessorPassed = passed;
    return Object.freeze({id, state, passed});
  });
  const next = orderedGates.find(gate => !gate.passed)?.id || null;
  return Object.freeze({
    schema: 'xen/xaoa-001-program/v1',
    programId: 'XAOA-001',
    state: next ? 'ACTIVE_BLOCKED' : 'GOLD_MASTER_COMPLETE',
    completed: next === null,
    next,
    orderedGates: Object.freeze(orderedGates),
    details: Object.freeze({xri, infrastructure, loop, phone, company, drills, goldMaster}),
    secretsIncluded: false
  });
}

export function createXAOAReceipt(input = {}) {
  const result = evaluateXAOA001(input);
  return Object.freeze({
    ...result,
    generatedAt: present(input.generatedAt) ? input.generatedAt : null,
    claimAllowed: result.completed,
    evidenceIds: Object.freeze(ORDER.flatMap(id => {
      if (id.startsWith('XRI-')) return [input.xri?.[id]?.evidenceId].filter(present);
      if (id === 'INFRASTRUCTURE') return REQUIRED_INFRASTRUCTURE.map(key => input.infrastructure?.[key]?.evidenceId).filter(present);
      if (id === 'DAILY_LOOP') return REQUIRED_LOOP.map(key => input.dailyLoop?.[key]?.evidenceId).filter(present);
      if (id === 'PHONE_ALPHA') return [input.phoneAlpha?.evidenceId].filter(present);
      if (id === 'LIVING_COMPANY') return [input.livingCompany?.evidenceId].filter(present);
      if (id === 'RECOVERY_DRILLS') return REQUIRED_DRILLS.map(key => input.drills?.[key]?.evidenceId).filter(present);
      return [input.goldMaster?.evidenceId].filter(present);
    }))
  });
}

