const clean = (value, name) => {
  const result = String(value ?? '').trim();
  if (!result) throw new Error(`missing_${name}`);
  return result;
};

export const unavailableResult = (reason = 'service_not_connected') => ({
  answer: 'Xen cannot verify an approved manual answer from this Daily Bread session. Open the governed Living Manual or ask a manager for guidance.',
  authority: 'escalation',
  escalationRequired: true,
  source: null,
  provenance: 'unavailable',
  dataLabel: 'WARDEN ESCALATION',
  reason
});

export function createAlphaOneClient({transport, identityProvider} = {}) {
  const invoke = async (action, payload) => {
    if (typeof transport !== 'function' || typeof identityProvider !== 'function') {
      return unavailableResult();
    }
    try {
      const context = await identityProvider();
      clean(context?.actorId, 'actor_id');
      clean(context?.tenantId, 'tenant_id');
      const result = await transport({action, payload, context});
      if (!result || !result.authority || !result.dataLabel) return unavailableResult('invalid_service_contract');
      if (!result.escalationRequired && (!result.source?.id || !result.source?.version)) {
        return unavailableResult('approved_citation_missing');
      }
      return result;
    } catch (error) {
      return unavailableResult(error?.message || 'service_request_failed');
    }
  };

  return Object.freeze({
    ask: ({question, language = 'en'}) => invoke('manual.ask', {question: clean(question, 'question'), language}),
    startPractice: ({scenario, language = 'en'}) => invoke('practice.start', {scenario: clean(scenario, 'scenario'), language})
  });
}

export function browserAlphaOneClient(runtime = globalThis.XEN_ALPHA_ONE_RUNTIME) {
  return createAlphaOneClient(runtime || {});
}
