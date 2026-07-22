import assert from 'node:assert/strict';import fs from 'node:fs';
const js=fs.readFileSync('app/alive.js','utf8'),css=fs.readFileSync('assets/css/alive.css','utf8');
for(const id of ['film','music','longform']){assert.match(js,new RegExp(id+":\\{"));assert.match(js,new RegExp("videoId:"));}
for(const action of ['data-preview','data-close-preview','youtube-nocookie.com','decorateGlobe','holo-continent'])assert.ok(js.includes(action),action);
for(const contract of ['.globe-module','.chamber-hud','.globe-scan','.media-thumb iframe','prefers-reduced-motion'])assert.ok(css.includes(contract),contract);
assert.ok(!js.includes('youtube.com/embed/'),'privacy-enhanced embeds only');
console.log('Xen Is Alive 2.0 Globe and media contract: PASS (15 assertions)');
