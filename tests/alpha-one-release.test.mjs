import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyReleaseMarker} from '../scripts/verify_alpha_one_release.mjs';

const commit = 'a'.repeat(40);
const endpoint = 'https://decureton-xencreator.github.io/daily-bread-/';
const marker = {schema:'xen/alpha-one-release-marker/v1',commit,endpoint,state:'DEPLOYED'};

test('accepts the exact immutable deployed release', () => {
  assert.equal(verifyReleaseMarker({marker,expectedCommit:commit,expectedEndpoint:endpoint}).state,'RELEASE_VERIFIED');
});

test('fails closed when the public release does not match the expected commit', () => {
  assert.equal(verifyReleaseMarker({marker,expectedCommit:'b'.repeat(40),expectedEndpoint:endpoint}).state,'RELEASE_MISMATCH');
});
