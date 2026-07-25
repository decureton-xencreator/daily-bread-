import {evaluateXAOA001} from './xaoa-program.js';
import {evaluateFederatedEvidence,federatedXriInput} from './evidence-federation.js';
import federationReceipt from '../data/xri-evidence-federation.json' with {type:'json'};
const LABELS=Object.freeze({'XRI-006':'Integration readiness','XRI-007':'Persistent runtime','XRI-008':'Identity boundary','XRI-009':'Provider integration','XRI-010':'Operational evidence',INFRASTRUCTURE:'Live infrastructure',DAILY_LOOP:'Daily operating loop',PHONE_ALPHA:'Phone Alpha',LIVING_COMPANY:'Measured company value',RECOVERY_DRILLS:'Recovery drills','XBP-009':'Gold Master decision'});
export function activationCenterModel(input={},receipt=federationReceipt){
  const federation=evaluateFederatedEvidence(receipt);
  const merged={...input,xri:{...federatedXriInput(receipt),...(input.xri||{})}};
  const result=evaluateXAOA001(merged),currentGate=result.next||'COMPLETE';
  return Object.freeze({schema:'xen/alpha-one-activation-center/v2',state:result.state,currentGate,stateLabel:result.completed?'Gold Master complete':'Evidence blocked - safe to continue',explanation:result.completed?'Every ordered gate carries valid evidence. Completion claims are permitted.':`${currentGate} is the first unmet gate. Successor gates remain locked so no unsupported activation claim can pass.`,federation:Object.freeze({...federation,statusLabel:federation.passed?'Canonical evidence accepted':'Canonical evidence rejected safely'}),gates:Object.freeze(result.orderedGates.map((gate,index)=>Object.freeze({...gate,index:String(index+1).padStart(2,'0'),label:LABELS[gate.id],current:gate.id===currentGate,tone:gate.passed?'pass':gate.id===currentGate?'current':'waiting',stateLabel:gate.passed?'Passed':gate.id===currentGate?'Evidence required':'Waiting for predecessor'}))),recovery:Object.freeze({title:`Continue ${currentGate} without losing the thread`,body:federation.passed?'Federated canonical evidence passed. Gather the next gate receipt and retry.':federation.recovery}),claimAllowed:result.completed,secretsIncluded:false});
}
export function activationContinuation(input={}){
  const model=activationCenterModel(input);
  return `Resume Xen Alpha One at ${model.currentGate}. State: ${model.state}. Gather authentic evidence for the current gate, validate it, retry evaluation, and do not advance or claim activation until the ordered controller passes.`;
}
