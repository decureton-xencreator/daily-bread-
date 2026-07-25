import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evaluateFederatedEvidence,federatedXriInput} from '../app/evidence-federation.js';
import {activationCenterModel} from '../app/activation-center.js';

const receipt=JSON.parse(fs.readFileSync('data/xri-evidence-federation.json','utf8'));
const matching={...receipt,candidates:[{
  identifier:'XRI-006',contract:'GOVERNED_WORKFLOW_EXECUTION_RUNTIME',
  name:'Governed Workflow Execution Runtime',status:'CANONICAL_CERTIFIED_ACTIVE',
  certificationLevel:'ENVIRONMENT',releaseCommit:'a'.repeat(40),workflowRun:'30000000000'
}],decision:{passed:true,message:'matching',nextAction:'continue'}};

test('rejects the live identifier collision without advancing',()=>{
  const result=evaluateFederatedEvidence(receipt);
  assert.equal(result.passed,false);
  assert.equal(result.code,'IDENTIFIER_COLLISION_CONTRACT_MISMATCH');
  assert.equal(result.collisionCount,1);
  assert.deepEqual(federatedXriInput(receipt),{});
  assert.equal(activationCenterModel({},receipt).currentGate,'XRI-006');
});

test('accepts only a matching environment-certified canonical receipt',()=>{
  const result=evaluateFederatedEvidence(matching);
  assert.equal(result.passed,true);
  assert.equal(result.code,'FEDERATED_EVIDENCE_ACCEPTED');
  assert.match(result.acceptedEvidence.evidenceId,/xen-operating-system@a{40}#30000000000/);
  assert.equal(activationCenterModel({},matching).currentGate,'XRI-007');
});

test('rejects malformed source, weak certification and privacy violations',()=>{
  assert.equal(evaluateFederatedEvidence({...matching,source:{...matching.source,observedCommit:'short'}}).passed,false);
  assert.equal(evaluateFederatedEvidence({...matching,candidates:[{...matching.candidates[0],certificationLevel:'REPOSITORY'}]}).passed,false);
  assert.equal(evaluateFederatedEvidence({...matching,privacy:{...matching.privacy,secretsIncluded:true}}).passed,false);
});
