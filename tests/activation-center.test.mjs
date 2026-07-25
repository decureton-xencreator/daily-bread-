import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {activationCenterModel,activationContinuation} from '../app/activation-center.js';

test('shows the real first gate and blocks unsupported claims',()=>{
  const model=activationCenterModel();
  assert.equal(model.currentGate,'XRI-006');
  assert.equal(model.claimAllowed,false);
  assert.equal(model.gates.length,11);
  assert.equal(model.gates[0].stateLabel,'Evidence required');
  assert.equal(model.gates[1].stateLabel,'Waiting for predecessor');
  assert.equal(model.secretsIncluded,false);
});
test('continuation is specific and non-secret',()=>{
  const text=activationContinuation();
  assert.match(text,/XRI-006/);
  assert.match(text,/do not advance or claim activation/);
  assert.doesNotMatch(text,/token|password|secret value/i);
});
test('production UI provides retry, guide, defer and continuation recovery',()=>{
  const html=fs.readFileSync('index.html','utf8');
  const ui=fs.readFileSync('app/command-deck-app.js','utf8');
  for(const marker of ['scene-activation','data-activation-retry','data-activation-guide'])assert.match(html,new RegExp(marker));
  for(const marker of ['data-activation-copy','data-activation-defer','activationContinuation','activationCenterModel'])assert.match(ui,new RegExp(marker));
});
