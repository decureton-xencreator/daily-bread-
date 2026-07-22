import assert from 'node:assert/strict';import fs from 'node:fs';
const js=fs.readFileSync('app/alive.js','utf8'),css=fs.readFileSync('assets/css/alive.css','utf8');
for(const id of ['film','music','longform']){assert.match(js,new RegExp(id+":\\{"));assert.match(js,new RegExp("videoId:"));}
for(const action of ['data-preview','data-close-preview','data-media-pause','data-media-expand','pauseVideo','playVideo','requestFullscreen','fullscreenchange','youtube-nocookie.com','enablejsapi=1','decorateGlobe','holo-continent','installLivingLight'])assert.ok(js.includes(action),action);
for(const contract of ['.globe-module','.chamber-hud','.globe-scan','.media-thumb iframe','.media-console','.cinema-mode','.xps-light-field','.aurora','.energy-rail','xps-active-breathe','prefers-reduced-motion'])assert.ok(css.includes(contract),contract);
assert.ok(!js.includes('youtube.com/embed/'),'privacy-enhanced embeds only');
console.log('Xen Is Alive 2.0 Globe and media contract: PASS (15 assertions)');
