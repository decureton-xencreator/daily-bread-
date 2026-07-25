import assert from 'node:assert/strict';
import fs from 'node:fs';
import {auditRecoveryResult,sanitizeControlTarget,summarizeControlAudit} from '../app/quality-guardian.js';

assert.deepEqual(auditRecoveryResult({passed:false,feedback:'Try again',canRetry:true,recovery:'correct-retry-or-defer'}),{passed:true,missing:[]});
assert.equal(auditRecoveryResult({passed:false,feedback:''}).passed,false);
assert.equal(sanitizeControlTarget('Submit Answer #3'),'submit-answer-3');
assert.equal(summarizeControlAudit([{labelled:true,actionable:true}]).passed,true);

const ui=fs.readFileSync('app/command-deck-app.js','utf8');
for(const marker of ['data-lesson-retry','data-lesson-hint','data-lesson-defer','auditRecoveryResult','correction-started','answer-deferred'])
  assert.match(ui,new RegExp(marker));
const runtime=fs.readFileSync('app/academy-runtime.js','utf8');
for(const marker of ['retryAcademyActivity','deferAcademyActivity','correct-retry-or-defer'])
  assert.match(runtime,new RegExp(marker));
const telemetry=fs.readFileSync('app/local-telemetry.js','utf8');
assert.match(telemetry,/rage-click/);
for(const forbidden of ['event.target.value','event.key.length','location.href'])
  assert.equal(telemetry.includes(forbidden),false);

console.log('XQG recovery, control audit and privacy-minimized diagnostics: PASS');
