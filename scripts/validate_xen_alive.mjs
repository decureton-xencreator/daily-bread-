import assert from 'node:assert/strict';import fs from 'node:fs';
const index=fs.readFileSync('index.html','utf8'),alive=fs.readFileSync('app/alive.js','utf8'),css=fs.readFileSync('assets/css/alive.css','utf8');
assert.match(index,/assets\/css\/alive\.css/);assert.match(index,/app\/alive\.js/);
for(const id of ['ai','finance','spanish','typing'])assert.match(alive,new RegExp(id+":\\{"));
for(const id of ['film','music','longform'])assert.match(alive,new RegExp(id+":\\{"));
for(const action of ['data-alive-start','data-alive-complete','data-alive-back','choose-entertainment'])assert.ok(alive.includes(action),action);
assert.ok(alive.includes('MutationObserver'));assert.ok(alive.includes('IntersectionObserver'));assert.ok(alive.includes('series-active'));assert.ok(alive.includes('setActiveSeries'));assert.ok(css.includes('prefers-reduced-motion'));assert.ok(css.includes('@keyframes glimmer'));assert.ok(css.includes('.media-thumb'));assert.ok(css.includes('@keyframes series-shimmer'));assert.ok(css.includes('@keyframes title-shimmer'));assert.ok(css.includes('.module.series-active'));
console.log('Xen Is Alive control and skin contract: PASS (24 assertions)');
