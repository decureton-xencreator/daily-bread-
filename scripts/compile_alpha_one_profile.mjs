import fs from 'node:fs';
import path from 'node:path';
import {compileAlphaOneProfile} from '../app/alpha-one-profile.js';

const args = process.argv.slice(2);
const value = flag => args[args.indexOf(flag) + 1];
const profilePath = value('--profile') || 'config/alpha-one.daily-bread.template.json';
const mode = value('--mode') || 'plan-only';
const outputPath = value('--output') || 'reports/alpha-one-plan.json';
const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
const result = compileAlphaOneProfile(profile, {mode});
fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`${result.state}: ${result.checks.filter(item => item.passed).length}/${result.checks.length} checks passed`);
if (!result.configured) process.exitCode = 2;
