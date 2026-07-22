const PLACEHOLDER = /^(?:REPLACE_WITH_|CHANGEME|TODO|TBD)/i;
const text = value => typeof value === 'string' ? value.trim() : '';
const check = (id, passed, detail) => Object.freeze({id, passed: Boolean(passed), detail});

export function compileAlphaOneProfile(profile = {}, {mode = 'plan-only'} = {}) {
  const users = Array.isArray(profile.pilotUsers) ? profile.pilotUsers : [];
  const metrics = Array.isArray(profile.successMetrics) ? profile.successMetrics : [];
  const refs = Array.isArray(profile.secretRefs) ? profile.secretRefs : [];
  const values = [profile.pilotId, profile.tenantId, profile.dataRegion, profile.identityProviderId,
    profile.experience?.deliveryWindow, ...users, ...Object.values(profile.approvals || {})];
  const checks = [
    check('schema', profile.schema === 'xen/alpha-one-daily-bread-profile/v1', 'Profile schema is supported.'),
    check('pilot_product', text(profile.pilotId) && profile.product === 'Xen Daily Bread', 'Daily Bread pilot identity is explicit.'),
    check('no_placeholders', values.every(value => text(value) && !PLACEHOLDER.test(text(value))), 'All activation inputs are filled.'),
    check('xen_endpoint', /^https:\/\/decureton-xencreator\.github\.io\/daily-bread-\/$/.test(text(profile.serviceEndpoint)), 'Endpoint is the certified Daily Bread publication.'),
    check('root_authority', profile.rootAuthority === 'Darren Cureton', 'Root authority remains Darren-only.'),
    check('pilot_users', users.length > 0 && users.every(user => text(user) && !PLACEHOLDER.test(text(user))), 'At least one approved pilot user is named by non-secret identifier.'),
    check('success_metrics', metrics.length >= 3 && metrics.every(metric => text(metric?.id) && Number.isFinite(metric?.target) && text(metric?.unit)), 'Pilot outcomes are measurable before activation.'),
    check('privacy_telemetry', profile.telemetry?.mode === 'privacy-minimized' && profile.telemetry?.rawPersonalContent === false && Number.isInteger(profile.telemetry?.retentionDays), 'Telemetry excludes raw personal content.'),
    check('indirect_secrets', refs.length > 0 && refs.every(ref => /^[A-Z][A-Z0-9_]+$/.test(ref)), 'Credentials are referenced by environment name only.'),
    check('commercial_terms', Number.isFinite(profile.commercial?.pilotPrice) && Number.isInteger(profile.commercial?.durationDays) && profile.commercial.durationDays > 0, 'Price and pilot duration are explicit.')
  ];
  const configured = checks.every(item => item.passed);
  const allowedModes = ['plan-only', 'staging-readiness', 'pilot-authorize'];
  if (!allowedModes.includes(mode)) throw new Error('unsupported_activation_mode');
  return Object.freeze({
    schema: 'xen/alpha-one-daily-bread-plan/v1',
    state: configured ? (mode === 'plan-only' ? 'PLAN_READY' : 'EVIDENCE_REQUIRED') : 'CONFIGURATION_BLOCKED',
    mode,
    configured,
    checks,
    missing: checks.filter(item => !item.passed).map(item => item.id),
    plan: configured ? Object.freeze({pilotId: profile.pilotId, tenantId: profile.tenantId, serviceVersion: profile.serviceVersion,
      serviceEndpoint: profile.serviceEndpoint, pilotUserCount: users.length, metricIds: metrics.map(metric => metric.id),
      secretRefs: refs, rawPersonalContent: false,
      next: mode === 'plan-only' ? 'staging-readiness' : mode === 'staging-readiness' ? 'pilot-authorize' : 'submit-authentic-evidence'}) : null,
    secretValues: null
  });
}
