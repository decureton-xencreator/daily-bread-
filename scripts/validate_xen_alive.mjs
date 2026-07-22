import assert from 'node:assert/strict';import fs from 'node:fs';
const index=fs.readFileSync('index.html','utf8'),alive=fs.readFileSync('app/alive.js','utf8'),css=fs.readFileSync('assets/css/alive.css','utf8');
assert.match(index,/assets\/css\/alive\.css/);assert.match(index,/app\/alive\.js/);
for(const id of ['ai','finance','spanish','typing'])assert.match(alive,new RegExp(id+":\\{"));
for(const id of ['film','music','longform'])assert.match(alive,new RegExp(id+":\\{"));
for(const action of ['data-alive-start','data-alive-complete','data-alive-back','choose-entertainment'])assert.ok(alive.includes(action),action);
assert.ok(alive.includes('MutationObserver'));assert.ok(alive.includes('IntersectionObserver'));assert.ok(alive.includes('series-active'));assert.ok(alive.includes('setActiveSeries'));assert.ok(css.includes('prefers-reduced-motion'));assert.ok(css.includes('@keyframes glimmer'));assert.ok(css.includes('.media-thumb'));assert.ok(css.includes('@keyframes series-shimmer'));assert.ok(css.includes('@keyframes title-shimmer'));assert.ok(css.includes('.module.series-active'));

for(const contract of ['xps-color-dock','xps-status','XPS ACTIVE','XEN IS ALIVE','xps-cinematic-skin','data-xps-skin'])assert.ok(alive.includes(contract)||css.includes(contract),contract);
for(const skin of ['cyan','violet','solar','emerald','crimson'])assert.ok(alive.includes("'"+skin+"'")&&css.includes('data-skin="'+skin+'"'),skin+' color entry');
for(const motion of ['xps-control-glimmer','xps-grid-drift','xps-edge-charge','xps-planet-breathe'])assert.ok(css.includes('@keyframes '+motion),motion);
assert.ok(css.includes('Tron energy architecture'));
assert.ok(css.includes('prefers-reduced-motion'));
console.log('XPS 3.0 cinematic presence contract: PASS (visible status, 5 color entries, 4 motion systems, reduced motion)');
