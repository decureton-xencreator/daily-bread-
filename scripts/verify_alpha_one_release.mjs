import fs from 'node:fs';

export function verifyReleaseMarker({marker = {}, expectedCommit = '', expectedEndpoint = ''} = {}) {
  const checks = [
    {id: 'schema', passed: marker.schema === 'xen/alpha-one-release-marker/v1'},
    {id: 'immutable_commit', passed: /^[0-9a-f]{40}$/.test(expectedCommit) && marker.commit === expectedCommit},
    {id: 'endpoint', passed: marker.endpoint === expectedEndpoint},
    {id: 'deployment_state', passed: marker.state === 'DEPLOYED'}
  ];
  return Object.freeze({
    schema: 'xen/alpha-one-release-verification/v1',
    state: checks.every(check => check.passed) ? 'RELEASE_VERIFIED' : 'RELEASE_MISMATCH',
    ready: checks.every(check => check.passed),
    checks,
    marker
  });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const args = process.argv.slice(2);
  const value = flag => args[args.indexOf(flag) + 1];
  const marker = JSON.parse(fs.readFileSync(value('--marker'), 'utf8'));
  const result = verifyReleaseMarker({
    marker,
    expectedCommit: value('--commit') || '',
    expectedEndpoint: value('--endpoint') || ''
  });
  fs.writeFileSync(value('--output') || 'reports/alpha-one-release-verification.json', `${JSON.stringify(result, null, 2)}\n`);
  console.log(result.state);
  if (!result.ready) process.exitCode = 4;
}
