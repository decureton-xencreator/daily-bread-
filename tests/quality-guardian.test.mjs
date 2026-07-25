import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SURFACE_REGISTRY,auditLinks,auditMedia,auditRecoveryResult,runQualitySweep,sanitizeControlTarget,summarizeControlAudit} from '../app/quality-guardian.js';

assert.deepEqual(auditRecoveryResult({passed:false,feedback:'Try again',canRetry:true,recovery:'correct-retry-or-defer'}),{passed:true,missing:[]});
assert.equal(auditRecoveryResult({passed:false,feedback:''}).passed,false);
assert.equal(sanitizeControlTarget('Submit Answer #3'),'submit-answer-3');
assert.equal(summarizeControlAudit([{labelled:true,actionable:true}]).passed,true);
assert.equal(SURFACE_REGISTRY.length,16);

const element=(tag,attributes={},text='')=>({
  tagName:tag.toUpperCase(),dataset:attributes.dataset||{},disabled:Boolean(attributes.disabled),id:attributes.id||'',textContent:text,
  getAttribute:name=>attributes[name]??null,hasAttribute:name=>attributes[name]!==undefined,
  matches:selector=>selector.split(',').some(part=>{
    part=part.trim();
    if(part==='a[href]')return tag==='a'&&Boolean(attributes.href);
    if(part==='button')return tag==='button';
    if(part==='input')return tag==='input';
    if(part==='textarea')return tag==='textarea';
    if(part==='select')return tag==='select';
    if(part==='[role="button"]')return attributes.role==='button';
    return false;
  }),
  attributes:Object.keys(attributes).map(name=>({name}))
});
const safeLink=element('a',{href:'https://example.com/watch',target:'_blank',rel:'noopener noreferrer'},'Watch');
const unsafeLink=element('a',{href:'https://example.com/watch'},'Watch');
const frame=element('iframe',{title:'Preview'});
assert.equal(auditLinks({querySelectorAll:()=>[safeLink]})[0].safeExternal,true);
assert.equal(auditLinks({querySelectorAll:()=>[unsafeLink]})[0].safeExternal,false);
assert.deepEqual(auditMedia({querySelectorAll:()=>[frame]})[0],{target:'preview',labelled:true,controllable:true});

const button=element('button',{id:'continue'},'Continue');
const surface={querySelectorAll:()=>[button]};
const root={
  querySelector:()=>surface,
  querySelectorAll:selector=>selector==='a[href]'?[safeLink]:selector==='video,audio,iframe'?[frame]:[button,safeLink]
};
const registry=SURFACE_REGISTRY.map(contract=>({...contract,minimumControls:contract.id==='navigation'?1:0}));
const sweep=runQualitySweep(root,registry);
assert.equal(sweep.passed,true);
assert.equal(sweep.surfaces.every(item=>item.present&&item.passed),true);

const ui=fs.readFileSync('app/command-deck-app.js','utf8');
for(const marker of ['data-lesson-retry','data-lesson-hint','data-lesson-defer','auditRecoveryResult','correction-started','answer-deferred','observeQuality','reportedGuardianFindings'])
  assert.match(ui,new RegExp(marker));
const runtime=fs.readFileSync('app/academy-runtime.js','utf8');
for(const marker of ['retryAcademyActivity','deferAcademyActivity','correct-retry-or-defer'])
  assert.match(runtime,new RegExp(marker));
const telemetry=fs.readFileSync('app/local-telemetry.js','utf8');
assert.match(telemetry,/rage-click/);
for(const forbidden of ['event.target.value','event.key.length','location.href'])
  assert.equal(telemetry.includes(forbidden),false);

const coverage=JSON.parse(fs.readFileSync('governance/XQG-1.1-SURFACE-COVERAGE.json','utf8'));
assert.equal(coverage.scope.registeredSurfaces,SURFACE_REGISTRY.length);
assert.equal(coverage.scope.commandDeckScenes,14);
assert.equal(coverage.validation.localSuite,'PASS');
assert.equal(coverage.validation.pdfVisualReview,'PASS');
assert.match(coverage.validation.pdfSha256,/^[a-f0-9]{64}$/);

console.log('XQG recovery, control audit and privacy-minimized diagnostics: PASS');
