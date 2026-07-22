import test from 'node:test';
import assert from 'node:assert/strict';
import {compileAlphaOneProfile} from '../app/alpha-one-profile.js';

const filled = {
  schema: 'xen/alpha-one-daily-bread-profile/v1', pilotId: 'daily-bread-founder-001', product: 'Xen Daily Bread',
  serviceVersion: '2.4.0', serviceEndpoint: 'https://decureton-xencreator.github.io/daily-bread-/', tenantId: 'xen-founder',
  dataRegion: 'us-east', identityProviderId: 'idp-governed', rootAuthority: 'Darren Cureton', pilotUsers: ['user-darren'],
  experience: {deliveryWindow: '06:00-08:00', timezone: 'America/New_York'}, commercial: {pilotPrice: 0, durationDays: 30},
  successMetrics: [{id:'daily-open-rate',target:.7,unit:'ratio'},{id:'weekly-active-days',target:4,unit:'days'},{id:'useful-rating',target:4,unit:'score_of_5'}],
  telemetry: {mode:'privacy-minimized',retentionDays:30,rawPersonalContent:false}, secretRefs:['ALPHA_ONE_IDENTITY_CREDENTIAL'],
  approvals: {privacy:'privacy-1',commercial:'commercial-1',production:'production-1',acceptanceOwner:'owner-1'}
};

test('template fails closed and exposes no secret values', () => {
  const template = {...filled, tenantId:'REPLACE_WITH_TENANT_ID'};
  const result = compileAlphaOneProfile(template);
  assert.equal(result.state, 'CONFIGURATION_BLOCKED');
  assert.equal(result.secretValues, null);
  assert.ok(result.missing.includes('no_placeholders'));
});

test('filled profile creates a plan without authorizing a pilot', () => {
  const result = compileAlphaOneProfile(filled);
  assert.equal(result.state, 'PLAN_READY');
  assert.equal(result.plan.next, 'staging-readiness');
  assert.deepEqual(result.plan.secretRefs, ['ALPHA_ONE_IDENTITY_CREDENTIAL']);
});

test('staging and authorization modes remain evidence gated', () => {
  assert.equal(compileAlphaOneProfile(filled,{mode:'staging-readiness'}).state, 'EVIDENCE_REQUIRED');
  assert.equal(compileAlphaOneProfile(filled,{mode:'pilot-authorize'}).state, 'EVIDENCE_REQUIRED');
});

test('rejects unapproved endpoint, root authority, telemetry and secret references', () => {
  const result = compileAlphaOneProfile({...filled, serviceEndpoint:'https://example.com',rootAuthority:'admin',
    telemetry:{mode:'full',retentionDays:30,rawPersonalContent:true},secretRefs:['actual-secret-value!']});
  assert.equal(result.configured,false);
  for (const id of ['xen_endpoint','root_authority','privacy_telemetry','indirect_secrets']) assert.ok(result.missing.includes(id));
});
