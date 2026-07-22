import test from 'node:test';
import assert from 'node:assert/strict';
import {createAlphaOneClient} from '../app/alpha-one-client.js';

const identityProvider = async () => ({actorId: 'employee-demo', tenantId: 'checkmate-demo'});

test('fails closed when no governed service is connected', async () => {
  const result = await createAlphaOneClient().ask({question: 'What is the next step?'});
  assert.equal(result.escalationRequired, true);
  assert.equal(result.dataLabel, 'WARDEN ESCALATION');
});

test('passes identity and language to the governed service transport', async () => {
  let request;
  const client = createAlphaOneClient({identityProvider, transport: async value => {
    request = value;
    return {answer: 'Confirme el proyecto.', authority: 'approved-source', escalationRequired: false, source: {id: 'BDC-APPT-001', version: '1.0'}, provenance: 'demo', dataLabel: 'DEMONSTRATION DATA'};
  }});
  const result = await client.ask({question: '¿Qué hago?', language: 'es'});
  assert.equal(request.context.tenantId, 'checkmate-demo');
  assert.equal(request.payload.language, 'es');
  assert.equal(result.source.id, 'BDC-APPT-001');
});

test('rejects an uncited answer from a connected transport', async () => {
  const client = createAlphaOneClient({identityProvider, transport: async () => ({answer: 'Unverified', authority: 'model', escalationRequired: false, dataLabel: 'LIVE APPROVED DATA'})});
  const result = await client.ask({question: 'What is policy?'});
  assert.equal(result.reason, 'approved_citation_missing');
  assert.equal(result.escalationRequired, true);
});

test('allows practice only through the same identity boundary', async () => {
  const client = createAlphaOneClient({identityProvider, transport: async ({action}) => ({prompt: 'Role play', authority: 'coaching', escalationRequired: true, dataLabel: 'PRACTICE · NOT LIVE EVALUATION', action})});
  const result = await client.startPractice({scenario: 'hesitant homeowner'});
  assert.equal(result.dataLabel, 'PRACTICE · NOT LIVE EVALUATION');
});
