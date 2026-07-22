const text = value => typeof value === 'string' ? value.trim() : '';
const isoDate = value => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(text(value));
const approvedRecord = (record, type) => Boolean(
  record && record.type === type && text(record.id) && text(record.approvedBy) && isoDate(record.approvedAt)
);
const check = (id, passed, detail, evidenceId = null) => Object.freeze({
  id,
  passed: Boolean(passed),
  detail,
  evidenceId: passed ? evidenceId : null
});

export function evaluatePilotReadiness(evidence = {}) {
  const metrics = Array.isArray(evidence.baselineMetrics) ? evidence.baselineMetrics : [];
  const validMetrics = metrics.length > 0 && metrics.every(metric =>
    text(metric?.id) && text(metric?.name) && Number.isFinite(metric?.value) && text(metric?.unit) && isoDate(metric?.measuredAt)
  );
  const sources = Array.isArray(evidence.approvedSources) ? evidence.approvedSources : [];
  const validSources = sources.length > 0 && sources.every(source =>
    text(source?.id) && text(source?.version) && source?.approved === true && text(source?.approvedBy) && isoDate(source?.approvedAt)
  );
  const tenant = evidence.tenantBoundary || {};
  const checks = [
    check('pilot_identity', text(evidence.pilotId) && isoDate(evidence.evaluatedAt), 'Pilot identifier and evaluation timestamp are present.', evidence.pilotId),
    check('executive_sponsor', approvedRecord(evidence.executiveSponsor, 'executive_sponsor'), 'Named executive sponsor approved the pilot.', evidence.executiveSponsor?.id),
    check('tenant_boundary', text(tenant.tenantId) && text(tenant.dataRegion) && tenant.isolationVerified === true && isoDate(tenant.verifiedAt), 'Tenant and data boundary are documented and verified.', tenant.id),
    check('privacy_approval', approvedRecord(evidence.privacyApproval, 'privacy_approval'), 'Privacy review is approved.', evidence.privacyApproval?.id),
    check('source_registry', validSources, 'At least one versioned organizational source is approved.', validSources ? `sources:${sources.length}` : null),
    check('baseline_metrics', validMetrics, 'At least one timestamped baseline metric is recorded.', validMetrics ? `metrics:${metrics.length}` : null),
    check('commercial_terms', approvedRecord(evidence.commercialTerms, 'commercial_terms'), 'Pilot scope and commercial terms are approved.', evidence.commercialTerms?.id),
    check('identity_evidence', approvedRecord(evidence.identityEvidence, 'identity_evidence'), 'Identity and role mapping are approved.', evidence.identityEvidence?.id),
    check('service_health', evidence.serviceHealth?.state === 'PRODUCTION_CONNECTION_VERIFIED' && text(evidence.serviceHealth?.serviceVersion) && isoDate(evidence.serviceHealth?.checkedAt), 'Production service connection has versioned health evidence.', evidence.serviceHealth?.id),
    check('acceptance_owner', approvedRecord(evidence.acceptanceOwner, 'acceptance_owner'), 'A named owner can accept or reject pilot outcomes.', evidence.acceptanceOwner?.id)
  ];
  const ready = checks.every(item => item.passed);
  return Object.freeze({
    schema: 'xen/alpha-one-pilot-readiness/v1',
    state: ready ? 'PILOT_AUTHORIZED' : 'PILOT_BLOCKED',
    ready,
    checks,
    missing: checks.filter(item => !item.passed).map(item => item.id),
    evaluatedAt: isoDate(evidence.evaluatedAt) ? evidence.evaluatedAt : null,
    credentialMaterial: null
  });
}

export function createPilotActivationReceipt(evidence = {}) {
  const readiness = evaluatePilotReadiness(evidence);
  if (!readiness.ready) return Object.freeze({...readiness, receipt: null});
  return Object.freeze({
    ...readiness,
    receipt: Object.freeze({
      schema: 'xen/alpha-one-pilot-activation-receipt/v1',
      pilotId: text(evidence.pilotId),
      tenantId: text(evidence.tenantBoundary?.tenantId),
      authorizedAt: evidence.evaluatedAt,
      serviceVersion: text(evidence.serviceHealth?.serviceVersion),
      sourceVersions: evidence.approvedSources.map(source => `${source.id}@${source.version}`),
      baselineMetricIds: evidence.baselineMetrics.map(metric => metric.id),
      approvalEvidenceIds: readiness.checks.map(item => item.evidenceId).filter(Boolean),
      secretsIncluded: false
    })
  });
}
