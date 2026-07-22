import crypto from 'node:crypto';

const REQUIRED_APPROVALS = ['privacy', 'commercial', 'production', 'acceptanceOwner'];

export function evaluateActivationEvidence({profile = {}, approvals = {}, mode = 'plan-only', commitSha = ''} = {}) {
  const records = approvals.records || {};
  const checks = [
    {id: 'approval_schema', passed: approvals.schema === 'xen/alpha-one-approval-record/v1'},
    {id: 'root_authority', passed: approvals.approvedBy === 'Darren Cureton'},
    {id: 'scope', passed: approvals.scope === profile.pilotId},
    {id: 'approval_records', passed: REQUIRED_APPROVALS.every(id => records[id]?.status === 'APPROVED' && records[id]?.id === profile.approvals?.[id])},
    {id: 'immutable_commit', passed: /^[0-9a-f]{40}$/.test(commitSha)},
    {id: 'endpoint', passed: /^https:\/\/decureton-xencreator\.github\.io\/daily-bread-\/$/.test(profile.serviceEndpoint || '')}
  ];
  const ready = checks.every(check => check.passed);
  const digest = crypto.createHash('sha256').update(JSON.stringify({pilotId: profile.pilotId, records, commitSha})).digest('hex');
  return Object.freeze({schema: 'xen/alpha-one-evidence-evaluation/v1', mode, state: ready ? 'EVIDENCE_ACCEPTED' : 'EVIDENCE_BLOCKED', ready, checks, commitSha, evidenceDigest: digest, secretValues: null});
}
