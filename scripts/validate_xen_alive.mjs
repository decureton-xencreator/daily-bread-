import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app/command-deck-app.js', 'utf8');
const css = fs.readFileSync('assets/css/command-deck.css', 'utf8');

assert.match(index, /assets\/css\/command-deck\.css/);
assert.match(index, /app\/command-deck-app\.js/);
assert.match(index, /assets\/images\/xen-globe\.png/);
assert.doesNotMatch(index, /assets\/css\/alive\.css|app\/alive\.js|assets\/css\/xdbs\.css|app\/app\.js/);

for (const scene of ['today', 'integration', 'academy', 'globe', 'intelligence', 'water-cooler', 'markets', 'xmi', 'mission', 'evolution', 'radar', 'timeline', 'archive', 'warden']) {
  assert.match(index, new RegExp(`id="scene-${scene}"`), `${scene} scene`);
}
for (const behavior of ['localStorage', 'deck-progress', 'scene-index', 'world-clocks', 'serviceWorker']) {
  assert.ok(app.includes(behavior), `${behavior} runtime`);
}
for (const contract of ['prefers-reduced-motion', '.hero-globe', '.globe-visual', '.deck-controls', '.scene-index']) {
  assert.ok(css.includes(contract), `${contract} visual contract`);
}

console.log('XPS 4.1 clean Command Deck contract: PASS (14 scenes, Xen globe, local persistence, reduced motion, no legacy overlays)');
