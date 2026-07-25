const SHA=/^[a-f0-9]{40}$/;
const LEVELS=Object.freeze({REPOSITORY_IMPLEMENTED:1,REPOSITORY:2,ENVIRONMENT:3,OPERATIONAL:4});
const present=value=>typeof value==='string'&&value.trim().length>0;

export function evaluateFederatedEvidence(receipt={}){
  const target=receipt.target||{},source=receipt.source||{},candidates=Array.isArray(receipt.candidates)?receipt.candidates:[];
  const matching=candidates.filter(candidate=>candidate.identifier===target.gate&&candidate.contract===target.contract);
  const certified=matching.find(candidate=>candidate.status==='CANONICAL_CERTIFIED_ACTIVE'
    && SHA.test(candidate.releaseCommit||'')
    && present(candidate.workflowRun)
    && (LEVELS[candidate.certificationLevel]||0)>=(LEVELS[target.minimumCertification]||Infinity));
  const collisions=candidates.filter(candidate=>candidate.identifier===target.gate&&candidate.contract!==target.contract);
  const sourceValid=present(source.repository)&&source.ref==='main'&&SHA.test(source.observedCommit||'');
  const privacySafe=receipt.privacy?.secretsIncluded===false
    && receipt.privacy?.rawWorkflowLogsIncluded===false
    && receipt.privacy?.credentialsIncluded===false;
  const passed=Boolean(sourceValid&&privacySafe&&certified);
  const code=passed?'FEDERATED_EVIDENCE_ACCEPTED'
    :collisions.length?'IDENTIFIER_COLLISION_CONTRACT_MISMATCH'
    :matching.length?'CERTIFICATION_LEVEL_INSUFFICIENT':'MATCHING_CONTRACT_RECEIPT_MISSING';
  return Object.freeze({
    schema:'xen/evidence-federation-decision/v1',
    passed,code,
    sourceRepository:source.repository||null,
    sourceCommit:source.observedCommit||null,
    targetGate:target.gate||null,
    targetContract:target.contract||null,
    candidateCount:candidates.length,
    collisionCount:collisions.length,
    acceptedEvidence:passed?Object.freeze({evidenceId:`${source.repository}@${certified.releaseCommit}#${certified.workflowRun}`,checkedAt:receipt.generatedAt,passed:true}):null,
    explanation:passed?`Accepted ${certified.name} at ${certified.certificationLevel} certification.`:receipt.decision?.message||'No contract-matching canonical evidence was accepted.',
    recovery:receipt.decision?.nextAction||'Publish matching evidence and regenerate the receipt.',
    secretsIncluded:false
  });
}

export function federatedXriInput(receipt={}){
  const decision=evaluateFederatedEvidence(receipt);
  return decision.passed?{[decision.targetGate]:decision.acceptedEvidence}:{};
}
