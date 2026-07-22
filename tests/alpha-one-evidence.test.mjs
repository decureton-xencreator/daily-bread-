import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateActivationEvidence} from '../app/alpha-one-evidence.js';

const profile = {pilotId:'p1',serviceEndpoint:'https://decureton-xencreator.github.io/daily-bread-/',approvals:{privacy:'a',commercial:'b',production:'c',acceptanceOwner:'d'}};
const approvals = {schema:'xen/alpha-one-approval-record/v1',scope:'p1',approvedBy:'Darren Cureton',records:{privacy:{id:'a',status:'APPROVED'},commercial:{id:'b',status:'APPROVED'},production:{id:'c',status:'APPROVED'},acceptanceOwner:{id:'d',status:'APPROVED'}}};

test('accepts matching staging approvals bound to immutable commit', () => assert.equal(evaluateActivationEvidence({profile,approvals,mode:'staging-readiness',commitSha:'a'.repeat(40)}).state,'EVIDENCE_ACCEPTED'));
test('fails closed for a missing approval', () => {
  const broken = structuredClone(approvals); broken.records.production.status='PENDING';
  assert.equal(evaluateActivationEvidence({profile,approvals:broken,mode:'pilot-authorize',commitSha:'a'.repeat(40)}).state,'EVIDENCE_BLOCKED');
});
test('fails closed for mutable ref and never exposes secrets', () => {
  const result=evaluateActivationEvidence({profile,approvals,commitSha:'main'});
  assert.equal(result.ready,false); assert.equal(result.secretValues,null);
});

test('staging can pass while production authorization remains live-evidence gated', () => {
  const staged = structuredClone(approvals); staged.records.production.status='PENDING_LIVE_EVIDENCE';
  assert.equal(evaluateActivationEvidence({profile,approvals:staged,mode:'staging-readiness',commitSha:'a'.repeat(40)}).ready,true);
  assert.equal(evaluateActivationEvidence({profile,approvals:staged,mode:'pilot-authorize',commitSha:'a'.repeat(40)}).ready,false);
});
