const present = value => typeof value === 'string' && value.trim().length > 0;

const safeCheck = (id, passed, detail) => Object.freeze({id, passed: Boolean(passed), detail});

export function evaluateAlphaOneActivation(config = {}) {
  const checks = [
    safeCheck('identity_provider', present(config.identityProviderId), 'Approved identity provider is named.'),
    safeCheck('service_endpoint', /^https:\/\//.test(String(config.serviceEndpoint || '')), 'Living Manual endpoint uses HTTPS.'),
    safeCheck('tenant_configuration', present(config.tenantId), 'Tenant boundary is explicitly configured.'),
    safeCheck('privacy_review', config.privacyReviewApproved === true, 'Privacy review is approved.'),
    safeCheck('source_approval', config.organizationalSourcesApproved === true, 'Organizational sources are approved.'),
    safeCheck('production_authorization', config.productionAuthorization === true, 'Production activation is authorized.')
  ];
  const configured = checks.slice(0, 3).every(check => check.passed);
  const approved = checks.slice(3).every(check => check.passed);
  return Object.freeze({
    schema: 'xen/alpha-one-activation-readiness/v1',
    state: configured && approved ? 'READY_FOR_HEALTH_CHECK' : 'ACTIVATION_BLOCKED',
    configured,
    approved,
    checks,
    credentialPresent: present(config.credential),
    credentialValue: null
  });
}

export async function verifyAlphaOneActivation({config = {}, healthCheck} = {}) {
  const readiness = evaluateAlphaOneActivation(config);
  if (readiness.state !== 'READY_FOR_HEALTH_CHECK') {
    return Object.freeze({...readiness, reachable: false, active: false, evidence: null});
  }
  if (typeof healthCheck !== 'function') {
    return Object.freeze({...readiness, state: 'HEALTH_CHECK_REQUIRED', reachable: false, active: false, evidence: null});
  }
  try {
    const result = await healthCheck({endpoint: config.serviceEndpoint, tenantId: config.tenantId});
    const reachable = result?.ok === true && present(result?.serviceVersion) && present(result?.checkedAt);
    return Object.freeze({
      ...readiness,
      state: reachable ? 'PRODUCTION_CONNECTION_VERIFIED' : 'HEALTH_CHECK_FAILED',
      reachable,
      active: reachable,
      evidence: reachable ? Object.freeze({serviceVersion: result.serviceVersion, checkedAt: result.checkedAt}) : null
    });
  } catch {
    return Object.freeze({...readiness, state: 'HEALTH_CHECK_FAILED', reachable: false, active: false, evidence: null});
  }
}
