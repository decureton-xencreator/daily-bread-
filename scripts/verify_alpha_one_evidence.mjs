import fs from 'node:fs';
import path from 'node:path';
import {evaluateActivationEvidence} from '../app/alpha-one-evidence.js';

const args = process.argv.slice(2);
const value = flag => args[args.indexOf(flag) + 1];
const profile = JSON.parse(fs.readFileSync(value('--profile'), 'utf8'));
const approvals = JSON.parse(fs.readFileSync(value('--approvals'), 'utf8'));
const output = value('--output') || 'reports/alpha-one-evidence.json';
const result = evaluateActivationEvidence({profile, approvals, mode: value('--mode'), commitSha: value('--commit') || ''});
fs.mkdirSync(path.dirname(output), {recursive: true});
fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(`${result.state}: ${result.checks.filter(check => check.passed).length}/${result.checks.length} checks passed`);
if (!result.ready) process.exitCode = 3;
