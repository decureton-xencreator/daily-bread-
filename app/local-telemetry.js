const KEY = 'xdbs-xer-local-telemetry-v1';
const MAX_FINDINGS = 40;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

function persist(value) {
  localStorage.setItem(KEY, JSON.stringify(value));
}

export function recordInteraction(kind, target = 'unknown') {
  const state = load();
  state.startedAt ||= new Date().toISOString();
  state.lastInteractionAt = new Date().toISOString();
  state.counts ||= {};
  const key = `${kind}:${target}`.slice(0, 100);
  state.counts[key] = (state.counts[key] || 0) + 1;
  persist(state);
}

export function recordFinding(code, context = '') {
  const state = load();
  state.findings ||= [];
  state.findings.unshift({code, context: String(context).slice(0, 160), at: new Date().toISOString()});
  state.findings = state.findings.slice(0, MAX_FINDINGS);
  persist(state);
}

export function telemetrySummary() {
  const state = load();
  return {
    startedAt: state.startedAt || null,
    lastInteractionAt: state.lastInteractionAt || null,
    interactionCount: Object.values(state.counts || {}).reduce((sum, value) => sum + value, 0),
    actionTypes: Object.keys(state.counts || {}).length,
    findingCount: (state.findings || []).length
  };
}

export function clearTelemetry() {
  localStorage.removeItem(KEY);
}

// Privacy contract: never capture printable keys, field values, notes, URLs with queries, or raw content.
export function safeKeyClass(event) {
  if (event.metaKey || event.ctrlKey) return 'shortcut';
  if (['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Escape', 'Enter', 'Tab'].includes(event.key)) return event.key.toLowerCase();
  return null;
}
