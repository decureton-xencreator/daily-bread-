import{priorities,courses,intelligence,entertainment,risks,timeline,evolution}from'./data.js';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const STORAGE='xdbs-command-deck-v2';
const initial={completed:[],saved:[],dismissed:[],notes:'',academy:{},integration:0,region:'Americas'};
let state=loadState(),active=0,toastTimer;
const scenes=$$('.scene');

function loadState(){try{return{...initial,...JSON.parse(localStorage.getItem(STORAGE)||'{}')}}catch{return{...initial}}}
function saveState(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function escapeHTML(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function notify(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}

const processStages=[
  ['SYNC','Reconcile approved repository state.'],['INHERIT','Accept compatible governed outcomes.'],['CLASSIFY','Declare the truthful capability state.'],
  ['PLAN GATE','Name outcome, evidence and stop conditions.'],['EXECUTE','Perform the bounded repository change.'],['VALIDATE','Test behavior, structure and privacy.'],
  ['TRUTH GATE','Reject unsupported completion.'],['RECORD','Commit durable proof and continuation.'],['RESPOND','Return the verified result and route.']
];

function render(){
  $('#hero-vitals').innerHTML=[
    ['Evidence-led','Operating mode'],['Learn. Measure. Advance.','Prime directive'],['Local only','Personal context'],['Verified deployment','System posture']
  ].map(([value,label])=>`<div class="vital"><b>${value}</b><span>${label}</span></div>`).join('');

  $('#integration-runtime').innerHTML=`<div class="process-rail">${processStages.map(([label],index)=>`<button class="process-step ${index===state.integration?'active':''}" data-process="${index}"><i>${String(index+1).padStart(2,'0')}</i><b>${label}</b></button>`).join('')}</div><div class="process-detail"><div><small class="eyebrow">CURRENT GATE</small><p><b>${processStages[state.integration][0]}</b> · ${processStages[state.integration][1]}</p></div><button class="action-button" data-process-advance>${state.integration===processStages.length-1?'Reset local run':'Advance with evidence'}</button></div>`;

  $('#academy-runtime').innerHTML=courses.map(course=>{
    const progress=state.academy[course.id]||0;
    return `<article class="course-row"><div><h3>${escapeHTML(course.name)}</h3><p>${escapeHTML(course.mission)} · ${escapeHTML(course.lesson)}</p></div><div class="progress-track" aria-label="${progress}% local progress"><i style="width:${progress}%"></i></div><button class="action-button" data-course="${course.id}">${progress?'Resume':'Begin'}</button></article>`;
  }).join('');

  const regions=['Americas','Europe','Asia','Africa','Oceania'];
  $('#region-controls').innerHTML=regions.map(region=>`<button class="${state.region===region?'active':''}" data-region="${region}">${region}</button>`).join('');
  $('#region-readout').textContent=`${state.region.toUpperCase()} · ACTIVE INTELLIGENCE LENS`;

  const categories=['All',...new Set(intelligence.map(item=>item.category))];
  $('#intel-filters').innerHTML=categories.map((category,index)=>`<button class="${index===0?'active':''}" data-filter="${category}">${category}</button>`).join('');
  renderIntelligence('All');

  const water=intelligence.filter(item=>item.category==='Water Cooler');
  $('#water-runtime').innerHTML=(water.length?water:intelligence.slice(0,2)).map((item,index)=>`<article class="brief-card ${index===0?'lead':''}"><div class="meta"><span>10-SECOND READ</span><span>${escapeHTML(item.freshness)}</span></div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.summary)}</p><p class="angle"><b>Conversation angle:</b> ${escapeHTML(item.action)}</p></article>`).join('');

  const market=intelligence.find(item=>item.category==='Markets')||intelligence.find(item=>item.category==='Business');
  $('#markets-runtime').innerHTML=`<div class="market-metric"><strong>LIVE</strong><span>SOURCE-LINKED POSTURE</span></div><div class="market-metric"><strong>${market?escapeHTML(market.confidence):'—'}</strong><span>CONFIDENCE</span></div><div class="market-metric"><strong>NOW</strong><span>DECISION HORIZON</span></div><div class="market-consequence"><b>${market?escapeHTML(market.title):'Market provider unavailable'}</b><br>${market?escapeHTML(market.consequence):'No current market consequence is asserted.'}<br><strong>Action:</strong> ${market?escapeHTML(market.action):'Use an authoritative market source before acting.'}</div>`;

  $('#xmi-runtime').innerHTML=entertainment.filter(item=>!state.dismissed.includes(item.id)).map(item=>`<article class="media-card"><small>${escapeHTML(item.type)}</small><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.why)}</p><div class="media-actions"><button class="action-button" data-save="${item.id}">${state.saved.includes(item.id)?'Saved ✓':'Save'}</button><button class="action-button" data-dismiss="${item.id}">Dismiss</button></div></article>`).join('')||'<div class="media-card"><h3>Recommendations cleared.</h3><p>Reset local state from the Command Deck index to restore them.</p></div>';

  const missionItems=[['academy','Complete the Academy minimum'],['evidence','Measure one Alpha One criterion'],['brief','Act on one verified Daily Bread signal'],['handoff','Record the exact continuation']];
  $('#mission-runtime').innerHTML=`<article class="mission-panel"><small class="eyebrow">ACTIVE MISSION</small><h3>Learn one thing. Measure one criterion. Move the mission.</h3>${missionItems.map(([id,label])=>`<div class="mission-check ${state.completed.includes(id)?'done':''}"><button data-complete="${id}" aria-label="Toggle ${escapeHTML(label)}">${state.completed.includes(id)?'✓':''}</button><span>${escapeHTML(label)}</span></div>`).join('')}</article><aside><label class="eyebrow" for="mission-notes">MISSION NOTES · LOCAL ONLY</label><textarea class="mission-notes" id="mission-notes" placeholder="Capture the next thought…">${escapeHTML(state.notes)}</textarea><p class="privacy">Auto-saved only in this browser.</p></aside>`;

  $('#evolution-runtime').innerHTML=evolution.map(item=>`<article class="evo-card"><small>${escapeHTML(item.status)}</small><strong>${escapeHTML(item.metric)}</strong><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.body)}</p></article>`).join('');
  $('#radar-runtime').innerHTML=risks.map(item=>`<article class="radar-card ${item.type}"><small>${escapeHTML(item.scope)} · ${item.type==='risk'?'RISK':'OPPORTUNITY'} · ${escapeHTML(item.level)}</small><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.body)}</p><details><summary>Recommended move</summary><p>${escapeHTML(item.action)}</p></details></article>`).join('');
  $('#timeline-runtime').innerHTML=timeline.map((item,index)=>`<div class="time-row ${state.completed.includes(`time-${index}`)?'done':''}"><b>${escapeHTML(item[0])}</b><i></i><span>${escapeHTML(item[1])}</span><button class="action-button" data-complete="time-${index}">${state.completed.includes(`time-${index}`)?'Done':'Complete'}</button></div>`).join('');

  $('#warden-runtime').innerHTML=`<article class="warden-panel">${[
    ['Command Deck runtime','LIVE'],['Current edition alias','REPOSITORY-BACKED'],['Academy, mission and preferences','LOCAL ONLY'],['Weather, world, markets and sports','SOURCE-LINKED'],['Calendar details','WITHHELD'],['Routes and biometrics','NOT CONNECTED'],['Analytics and tracking','NONE']
  ].map(([label,status])=>`<div class="diagnostic-row"><span>${label}</span><b class="${status.includes('NOT')||status.includes('WITHHELD')?'warn':''}">${status}</b></div>`).join('')}</article><article class="warden-panel"><p class="eyebrow">PRIVACY BOUNDARY</p><p>Raw chat, itinerary, calendar details, biometrics, Academy metrics and notes are excluded from public source.</p><p class="eyebrow">SYSTEM</p><p>XDBS 3.0 · XPS 4.1 Clean Command Deck · Edition 2.6.0</p><a class="text-link" href="reports/validation-report.json">Open validation evidence →</a></article>`;
  loadArchive();
}

function renderIntelligence(filter){
  $('#intel-runtime').innerHTML=intelligence.filter(item=>filter==='All'||item.category===filter).map(item=>`<article class="signal-card"><div class="meta"><span>${escapeHTML(item.category)}</span><span>${escapeHTML(item.confidence)} confidence</span><span>${escapeHTML(item.freshness)}</span></div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.summary)}</p><details><summary>Meaning → consequence → action</summary><p><b>Why:</b> ${escapeHTML(item.why)}</p><p><b>Consequence:</b> ${escapeHTML(item.consequence)}</p><p><b>Action:</b> ${escapeHTML(item.action)}</p>${item.source?`<a class="text-link" href="${item.source}" target="_blank" rel="noopener noreferrer">Open source →</a>`:''}</details></article>`).join('');
}

async function loadArchive(){try{const data=await fetch('data/editions.json').then(response=>{if(!response.ok)throw Error();return response.json()});$('#archive-runtime').innerHTML=data.editions.slice(0,6).map(edition=>`<a class="archive-card" href="${edition.path}"><small>${escapeHTML(edition.date)} · ${escapeHTML(edition.version||edition.format)}</small><h3>${escapeHTML(edition.title)}</h3><p>${escapeHTML(edition.summary||edition.mode)}</p></a>`).join('')}catch{$('#archive-runtime').innerHTML='<article class="archive-card"><h3>Archive manifest unavailable.</h3><p>Warden has preserved this degraded state without inventing editions.</p></article>'}}

function tick(){
  const now=new Date();
  $('#local-time').textContent=new Intl.DateTimeFormat([],{hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(now);
  const zones=[['New York','America/New_York'],['London','Europe/London'],['Singapore','Asia/Singapore'],['Dubai','Asia/Dubai']];
  $('#world-clocks').innerHTML=zones.map(([city,zone])=>`<div class="world-clock"><b>${city}</b><span>${new Intl.DateTimeFormat([],{timeZone:zone,hour:'numeric',minute:'2-digit'}).format(now)}</span></div>`).join('');
}

function setScene(index,focus=true){
  active=Math.max(0,Math.min(index,scenes.length-1));
  scenes.forEach((scene,i)=>scene.classList.toggle('active',i===active));
  const scene=scenes[active];
  $('#deck-progress').style.width=`${((active+1)/scenes.length)*100}%`;
  $('#deck-count').textContent=`${String(active+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;
  $('#scene-status').textContent=`${String(active+1).padStart(2,'0')} · ${scene.dataset.label.toUpperCase()}`;
  $('#deck-back').disabled=active===0;$('#deck-next').disabled=active===scenes.length-1;
  $$('[data-scene-index]').forEach((button,i)=>button.classList.toggle('active',i===active));
  history.replaceState(null,'',`#${scene.id}`);
  if(focus)scene.focus({preventScroll:true});
}

function openIndex(){
  const panel=$('#scene-index');
  panel.hidden=false;
  $('#scene-index-list').innerHTML=scenes.map((scene,index)=>`<button type="button" data-scene-index="${index}" class="${index===active?'active':''}"><i>${String(index+1).padStart(2,'0')}</i><span>${escapeHTML(scene.dataset.label)}</span><small>${scene.id.replace('scene-','')}</small></button>`).join('');
  $('#scene-index-close').focus();
}

document.addEventListener('click',event=>{
  if(event.target.closest('#deck-back'))setScene(active-1);
  if(event.target.closest('#deck-next'))setScene(active+1);
  if(event.target.closest('#deck-index-button,[data-open-index]'))openIndex();
  if(event.target.closest('#scene-index-close')){$('#scene-index').hidden=true;$('#deck-index-button').focus()}
  const jump=event.target.closest('[data-jump]');if(jump)setScene(scenes.findIndex(scene=>scene.id===jump.dataset.jump));
  const indexed=event.target.closest('[data-scene-index]');if(indexed){$('#scene-index').hidden=true;setScene(Number(indexed.dataset.sceneIndex))}
  const process=event.target.closest('[data-process]');if(process){state.integration=Number(process.dataset.process);saveState();render()}
  if(event.target.closest('[data-process-advance]')){state.integration=state.integration===processStages.length-1?0:state.integration+1;saveState();render();notify('Integration gate saved locally.')}
  const course=event.target.closest('[data-course]');if(course){state.academy[course.dataset.course]=Math.min(100,(state.academy[course.dataset.course]||0)+12);saveState();render();notify('Academy checkpoint saved locally.')}
  const region=event.target.closest('[data-region]');if(region){state.region=region.dataset.region;saveState();render();notify(`${state.region} intelligence lens active.`)}
  const filter=event.target.closest('[data-filter]');if(filter){$$('[data-filter]').forEach(button=>button.classList.toggle('active',button===filter));renderIntelligence(filter.dataset.filter)}
  const save=event.target.closest('[data-save]');if(save){state.saved=state.saved.includes(save.dataset.save)?state.saved.filter(id=>id!==save.dataset.save):[...state.saved,save.dataset.save];saveState();render()}
  const dismiss=event.target.closest('[data-dismiss]');if(dismiss){state.dismissed=[...state.dismissed,dismiss.dataset.dismiss];saveState();render()}
  const complete=event.target.closest('[data-complete]');if(complete){state.completed=state.completed.includes(complete.dataset.complete)?state.completed.filter(id=>id!==complete.dataset.complete):[...state.completed,complete.dataset.complete];saveState();render()}
  if(event.target.closest('#reset-local')){localStorage.removeItem(STORAGE);state={...initial,academy:{},completed:[],saved:[],dismissed:[]};$('#scene-index').hidden=true;render();notify('Local Daily Bread state reset.')}
  if(event.target.closest('#open-preferences'))notify('Preferences remain private and local. Use regional and Academy controls in the deck.');
});
document.addEventListener('input',event=>{if(event.target.id==='mission-notes'){state.notes=event.target.value;saveState()}});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!$('#scene-index').hidden){$('#scene-index').hidden=true;return}
  if(event.target.matches('textarea,input'))return;
  if(event.key==='ArrowRight'||event.key==='PageDown')setScene(active+1);
  if(event.key==='ArrowLeft'||event.key==='PageUp')setScene(active-1);
  if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openIndex()}
});

const hashIndex=scenes.findIndex(scene=>`#${scene.id}`===location.hash);
render();tick();setScene(hashIndex>=0?hashIndex:0,false);setInterval(tick,30000);
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
