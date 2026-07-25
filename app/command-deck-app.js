import{priorities,courses,intelligence,entertainment,risks,timeline,evolution}from'./data.js';
import{ACADEMY_SCHEDULE,LESSONS,normalizeAcademy,academyAlerts,startLesson,saveAcademyDraft,submitAcademyResponse,advanceLesson,previousLessonActivity,completeAcademyLesson}from'./academy-runtime.js';
import{recordInteraction,recordFinding,telemetrySummary,clearTelemetry,safeKeyClass}from'./local-telemetry.js';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const STORAGE='xdbs-command-deck-v2';
const initial={completed:[],saved:[],dismissed:[],notes:'',academy:{},integration:0,region:'Americas',alertsEnabled:false,tutorialSeen:false};
let state=loadState(),active=0,toastTimer,activeLesson=null,lessonTimer=null,tutorialStep=0;
state.academy=normalizeAcademy(state.academy);
const scenes=$$('.scene');
const tutorial=[
  {kicker:'WELCOME ABOARD',title:'Your command deck,<br>in six moves.',copy:'Daily Bread turns verified signal into a clear daily operating rhythm. This tour shows you where to look, what to press and what stays private.',callout:'Use NEXT and BACK to move through the deck. INDEX opens every module instantly.',scene:'scene-today'},
  {kicker:'01 · NAVIGATE',title:'Move by sequence.<br>Jump by intent.',copy:'The bottom arrows move one scene at a time. INDEX reveals the full Command Deck. On a keyboard, use the arrow keys or Control/Command + K.',callout:'The cyan line and scene counter always show where you are.',scene:'scene-integration'},
  {kicker:'02 · LEARN',title:'Start once.<br>Resume anywhere.',copy:'Academy Command is the prime directive. Open a real lesson, move through its steps, pause safely, and complete it only after the final checkpoint.',callout:'Overdue learning appears as a blunt red alert. Your exact lesson position stays on this device.',scene:'scene-academy'},
  {kicker:'03 · ORIENT',title:'Use the Globe<br>as your world lens.',copy:'Choose a region to reorient the intelligence lens. The Globe, world clocks, verified developments and consequence cards help you understand what matters beyond the headline.',callout:'Precise location and private travel details are not published.',scene:'scene-globe'},
  {kicker:'04 · ACT',title:'Open sources.<br>Make the move.',copy:'Intelligence cards expand from event to meaning, consequence and action. Entertainment cards open the verified watch page or preview. Mission Control turns the brief into completion.',callout:'Buttons are functional: open, save, dismiss, complete or resume. Warden rejects decorative controls.',scene:'scene-xmi'},
  {kicker:'05 · TRUST',title:'Inspect the truth.<br>Keep refining.',copy:'Warden Diagnostics separates live, repository-backed, local and unavailable capabilities. XER learns from aggregate interactions and failures to improve the experience.',callout:'Typed text, passwords and raw printable keystrokes are never collected. Replay this guide anytime from GUIDE or the Command Deck index.',scene:'scene-warden'}
];

function loadState(){try{return{...initial,...JSON.parse(localStorage.getItem(STORAGE)||'{}')}}catch{return{...initial}}}
function saveState(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function escapeHTML(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function notify(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}

function renderTutorial(){
  const step=tutorial[tutorialStep];
  $('#tutorial-count').textContent=`${String(tutorialStep+1).padStart(2,'0')} / ${String(tutorial.length).padStart(2,'0')}`;
  $('#tutorial-kicker').textContent=step.kicker;
  $('#tutorial-title').innerHTML=step.title;
  $('#tutorial-copy').textContent=step.copy;
  $('#tutorial-callout').textContent=step.callout;
  $('#tutorial-back').disabled=tutorialStep===0;
  $('#tutorial-next').textContent=tutorialStep===tutorial.length-1?'Finish tour':tutorialStep===0?'Begin tour':'Next';
  const sceneIndex=scenes.findIndex(scene=>scene.id===step.scene);
  if(sceneIndex>=0)setScene(sceneIndex,false);
}

function openTutorial(start=0){
  tutorialStep=Math.max(0,Math.min(start,tutorial.length-1));
  $('#scene-index').hidden=true;
  $('#tutorial-panel').hidden=false;$('#tutorial-backdrop').hidden=false;
  document.body.classList.add('tutorial-open');
  renderTutorial();$('#tutorial-close').focus();
  recordInteraction('tutorial','open');
}

function closeTutorial(completed=false){
  $('#tutorial-panel').hidden=true;$('#tutorial-backdrop').hidden=true;
  document.body.classList.remove('tutorial-open');
  if(completed){state.tutorialSeen=true;saveState();recordInteraction('tutorial','complete');notify('Tour complete. GUIDE reopens it anytime.')}
  $('#tutorial-launch').focus();
}

function alertSummary(){
  const alerts=academyAlerts(state.academy),overdue=alerts.filter(item=>item.level==='overdue');
  const rail=$('#academy-alert');
  if(!overdue.length){rail.className='academy-alert clear';rail.innerHTML='<b>ACADEMY ON SCHEDULE</b><span>Daily minimum protected.</span>';return}
  const names=overdue.map(item=>courses.find(course=>course.id===item.courseId)?.name||item.courseId).join(' + ');
  rail.className='academy-alert overdue';
  rail.innerHTML=`<b>ACADEMY OVERDUE</b><span>${escapeHTML(names)}. No excuses: complete the 20-minute daily minimum now.</span><button type="button" data-jump="scene-academy">OPEN ACADEMY</button>${state.alertsEnabled?'':'<button type="button" data-enable-alerts>ENABLE DEVICE ALERTS</button>'}`;
}

function openLesson(courseId){
  if(!LESSONS[courseId])return;
  activeLesson=courseId;
  state.academy=startLesson(state.academy,courseId);
  saveState();recordInteraction('academy','start-or-resume');
  $('#lesson-drawer').hidden=false;$('#lesson-backdrop').hidden=false;
  renderLesson();
  $('#lesson-close').focus();
}

function activityControl(activity,draft){
  if(activity.type==='lesson')return`<div class="lesson-foundation"><p>${escapeHTML(activity.body)}</p><button class="primary" type="button" data-lesson-submit value="reviewed">I reviewed this · continue</button></div>`;
  if(activity.type==='choice')return`<fieldset class="academy-choice"><legend>${escapeHTML(activity.prompt)}</legend>${activity.options.map((option,index)=>`<label><input type="radio" name="academy-answer" value="${escapeHTML(option)}" ${draft===option?'checked':''}><span><i>${String.fromCharCode(65+index)}</i>${escapeHTML(option)}</span></label>`).join('')}</fieldset><button class="primary" type="button" data-lesson-submit>Submit answer</button>`;
  const target=activity.type==='typing'?`<div class="typing-target"><small>COPY EXACTLY</small><pre>${escapeHTML(Array.from({length:activity.repetitions||1},()=>activity.target).join('\n'))}</pre></div>`:'';
  const hint=activity.hint?`<p class="academy-hint">${escapeHTML(activity.hint)}</p>`:'';
  const inputMode=activity.type==='number'?'decimal':'text';
  const rows=activity.type==='typing'?Math.max(4,(activity.repetitions||1)+2):activity.type==='reflection'?6:3;
  return`${target}<label class="academy-answer-label" for="academy-answer">YOUR ANSWER · SAVED LOCALLY</label><textarea id="academy-answer" rows="${rows}" inputmode="${inputMode}" autocomplete="off" autocapitalize="${activity.type==='typing'?'off':'sentences'}" spellcheck="${activity.type==='typing'?'false':'true'}" placeholder="Enter your answer here…">${escapeHTML(draft||'')}</textarea>${hint}<button class="primary" type="button" data-lesson-submit>Grade my answer</button>`;
}

function renderLesson(){
  const lesson=LESSONS[activeLesson],record=state.academy[activeLesson],activity=lesson.activities[record.step],result=record.results[activity.id],draft=record.responses[activity.id]||'';
  const passed=result?.passed;
  $('#lesson-title').textContent=lesson.title;
  $('#lesson-runtime').innerHTML=`<section class="lesson-status"><span>${escapeHTML(lesson.mission)}</span><b>ACTIVITY ${record.step+1} / ${lesson.activities.length}</b><strong>${record.score} / 100 · ${lesson.passingScore}% TO PASS</strong></section><div class="lesson-progress"><i style="width:${((record.step+(passed?1:0))/lesson.activities.length)*100}%"></i></div><article class="lesson-step"><p class="eyebrow">${escapeHTML(activity.title)}</p><h3>${escapeHTML(activity.prompt)}</h3><div class="academy-work">${activityControl(activity,draft)}</div>${result?`<div class="academy-feedback ${passed?'pass':'retry'}" role="status"><b>${passed?'PASS':'RETRY'}</b><span>${escapeHTML(result.feedback)}</span></div>`:''}</article><div class="lesson-actions">${record.step?'<button class="secondary" type="button" data-lesson-back>Previous</button>':''}${passed&&record.step<lesson.activities.length-1?'<button class="primary" type="button" data-lesson-next>Continue to next activity</button>':''}${passed&&record.step===lesson.activities.length-1?'<button class="primary" type="button" data-lesson-finish>Complete lesson · save score</button>':''}<button class="secondary" type="button" data-lesson-pause>Pause · save checkpoint</button></div><p class="privacy">Your answers, score and exact position are stored only in this browser for grading and Resume Anywhere. XER telemetry never receives answer text or raw printable keystrokes.</p>`;
  if(!passed){const answer=$('#academy-answer');if(answer)answer.focus({preventScroll:true})}
}

function closeLesson(message='Lesson checkpoint saved. Resume Anywhere is active.'){
  $('#lesson-drawer').hidden=true;$('#lesson-backdrop').hidden=true;
  if(lessonTimer)clearInterval(lessonTimer);lessonTimer=null;activeLesson=null;
  notify(message);
}

const processStages=[
  ['SYNC','Reconcile approved repository state.'],['INHERIT','Accept compatible governed outcomes.'],['CLASSIFY','Declare the truthful capability state.'],
  ['PLAN GATE','Name outcome, evidence and stop conditions.'],['EXECUTE','Perform the bounded repository change.'],['VALIDATE','Test behavior, structure and privacy.'],
  ['TRUTH GATE','Reject unsupported completion.'],['RECORD','Commit durable proof and continuation.'],['RESPOND','Return the verified result and route.']
];

function render(){
  alertSummary();
  $('#hero-vitals').innerHTML=[
    ['Evidence-led','Operating mode'],['Learn. Measure. Advance.','Prime directive'],['Local only','Personal context'],['Verified deployment','System posture']
  ].map(([value,label])=>`<div class="vital"><b>${value}</b><span>${label}</span></div>`).join('');

  $('#integration-runtime').innerHTML=`<div class="process-rail">${processStages.map(([label],index)=>`<button class="process-step ${index===state.integration?'active':''}" data-process="${index}"><i>${String(index+1).padStart(2,'0')}</i><b>${label}</b></button>`).join('')}</div><div class="process-detail"><div><small class="eyebrow">CURRENT GATE</small><p><b>${processStages[state.integration][0]}</b> · ${processStages[state.integration][1]}</p></div><button class="action-button" data-process-advance>${state.integration===processStages.length-1?'Reset local run':'Advance with evidence'}</button></div>`;

  const alerts=academyAlerts(state.academy);
  $('#academy-runtime').innerHTML=`<div class="academy-order"><b>TODAY—NON-NEGOTIABLE</b><span>12 min Typing + 8 min Spanish. Applied AI: Mon/Wed/Fri. Finance: Tue/Thu.</span></div>`+courses.map(course=>{
    const record=state.academy[course.id],alert=alerts.find(item=>item.courseId===course.id);
    const progress=record.progress||0;
    const actionLabel=record.status==='completed'?'Start today’s lesson':record.lastStartedAt?'Resume full lesson':'Start full lesson';
    return `<article class="course-row ${alert.level}"><div><small class="course-alert">${escapeHTML(alert.label)}</small><h3>${escapeHTML(course.name)}</h3><p>${escapeHTML(course.mission)} · ${escapeHTML(course.lesson)}</p><small>${record.completedLessons} completed · ${record.score}/100 latest score · ${record.xp} XP · ${record.status.replaceAll('-',' ')}</small></div><div class="progress-track" aria-label="${progress}% local progress"><i style="width:${progress}%"></i></div><button class="action-button" data-course="${course.id}">${actionLabel}</button></article>`;
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

  $('#xmi-runtime').innerHTML=entertainment.filter(item=>!state.dismissed.includes(item.id)).map(item=>`<article class="media-card"><small>${escapeHTML(item.type)}</small><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.why)}</p><div class="media-actions">${item.watchUrl?`<a class="action-button" href="${item.watchUrl}" target="_blank" rel="noopener noreferrer" data-outbound="watch-${item.id}">Watch now</a>`:''}${item.previewUrl?`<a class="action-button" href="${item.previewUrl}" target="_blank" rel="noopener noreferrer" data-outbound="preview-${item.id}">Preview</a>`:''}<button class="action-button" data-save="${item.id}">${state.saved.includes(item.id)?'Saved ✓':'Save'}</button><button class="action-button" data-dismiss="${item.id}">Dismiss</button></div></article>`).join('')||'<div class="media-card"><h3>Recommendations cleared.</h3><p>Reset local state from the Command Deck index to restore them.</p></div>';

  const missionItems=[['academy','Complete the Academy minimum'],['evidence','Measure one Alpha One criterion'],['brief','Act on one verified Daily Bread signal'],['handoff','Record the exact continuation']];
  $('#mission-runtime').innerHTML=`<article class="mission-panel"><small class="eyebrow">ACTIVE MISSION</small><h3>Learn one thing. Measure one criterion. Move the mission.</h3>${missionItems.map(([id,label])=>`<div class="mission-check ${state.completed.includes(id)?'done':''}"><button data-complete="${id}" aria-label="Toggle ${escapeHTML(label)}">${state.completed.includes(id)?'✓':''}</button><span>${escapeHTML(label)}</span></div>`).join('')}</article><aside><label class="eyebrow" for="mission-notes">MISSION NOTES · LOCAL ONLY</label><textarea class="mission-notes" id="mission-notes" placeholder="Capture the next thought…">${escapeHTML(state.notes)}</textarea><p class="privacy">Auto-saved only in this browser.</p></aside>`;

  $('#evolution-runtime').innerHTML=evolution.map(item=>`<article class="evo-card"><small>${escapeHTML(item.status)}</small><strong>${escapeHTML(item.metric)}</strong><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.body)}</p></article>`).join('');
  $('#radar-runtime').innerHTML=risks.map(item=>`<article class="radar-card ${item.type}"><small>${escapeHTML(item.scope)} · ${item.type==='risk'?'RISK':'OPPORTUNITY'} · ${escapeHTML(item.level)}</small><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.body)}</p><details><summary>Recommended move</summary><p>${escapeHTML(item.action)}</p></details></article>`).join('');
  $('#timeline-runtime').innerHTML=timeline.map((item,index)=>`<div class="time-row ${state.completed.includes(`time-${index}`)?'done':''}"><b>${escapeHTML(item[0])}</b><i></i><span>${escapeHTML(item[1])}</span><button class="action-button" data-complete="time-${index}">${state.completed.includes(`time-${index}`)?'Done':'Complete'}</button></div>`).join('');

  const telemetry=telemetrySummary();
  $('#warden-runtime').innerHTML=`<article class="warden-panel">${[
    ['Command Deck runtime','LIVE'],['Current edition alias','REPOSITORY-BACKED'],['Guided product tutorial','LOCAL · REPLAYABLE'],['Academy lessons + grading','LOCAL · EVIDENCE-GATED'],['Academy Resume Anywhere','LOCAL · RESUMABLE'],['Warden + XER + XEW sync','REPOSITORY-BACKED'],['Safe interaction telemetry',`${telemetry.interactionCount} LOCAL EVENTS`],['Raw keys / answer text in telemetry','NEVER CAPTURED'],['Calendar details','WITHHELD'],['Routes and biometrics','NOT CONNECTED']
  ].map(([label,status])=>`<div class="diagnostic-row"><span>${label}</span><b class="${status.includes('NOT')||status.includes('WITHHELD')?'warn':''}">${status}</b></div>`).join('')}</article><article class="warden-panel"><p class="eyebrow">PRIVACY BOUNDARY</p><p>Raw chat, itinerary, calendar details and biometrics are excluded from public source. Academy answers and grades remain local to this browser.</p><p class="eyebrow">SYSTEM</p><p>XDBS 3.0 · XPS 4.4 Full Academy · Edition 2.6.0</p><a class="text-link" href="reports/validation-report.json">Open validation evidence →</a></article>`;
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

function enforceSchedule(){
  const overdue=academyAlerts(state.academy).filter(item=>item.level==='overdue');
  if(!overdue.length||!state.alertsEnabled||!('Notification'in window)||Notification.permission!=='granted')return;
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:ACADEMY_SCHEDULE.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(state.lastAcademyAlertDay===day)return;
  new Notification('Xen Academy is overdue',{body:'Your 20-minute minimum is not complete. Open Daily Bread: 12 min Typing + 8 min Spanish.'});
  state.lastAcademyAlertDay=day;saveState();
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
  const tracked=event.target.closest('button,a,[data-action]');
  if(tracked)recordInteraction('click',tracked.dataset.action||tracked.dataset.course||tracked.dataset.outbound||tracked.id||tracked.tagName.toLowerCase());
  if(event.target.closest('#deck-back'))setScene(active-1);
  if(event.target.closest('#deck-next'))setScene(active+1);
  if(event.target.closest('#deck-index-button,[data-open-index]'))openIndex();
  if(event.target.closest('#tutorial-launch,#tutorial-replay'))openTutorial();
  if(event.target.closest('#tutorial-close,#tutorial-skip,#tutorial-backdrop'))closeTutorial(false);
  if(event.target.closest('#tutorial-back')){tutorialStep=Math.max(0,tutorialStep-1);renderTutorial()}
  if(event.target.closest('#tutorial-next')){if(tutorialStep===tutorial.length-1)closeTutorial(true);else{tutorialStep+=1;renderTutorial()}}
  if(event.target.closest('#scene-index-close')){$('#scene-index').hidden=true;$('#deck-index-button').focus()}
  const jump=event.target.closest('[data-jump]');if(jump)setScene(scenes.findIndex(scene=>scene.id===jump.dataset.jump));
  const indexed=event.target.closest('[data-scene-index]');if(indexed){$('#scene-index').hidden=true;setScene(Number(indexed.dataset.sceneIndex))}
  const process=event.target.closest('[data-process]');if(process){state.integration=Number(process.dataset.process);saveState();render()}
  if(event.target.closest('[data-process-advance]')){state.integration=state.integration===processStages.length-1?0:state.integration+1;saveState();render();notify('Integration gate saved locally.')}
  const course=event.target.closest('[data-course]');if(course)openLesson(course.dataset.course);
  if(event.target.closest('#lesson-close,#lesson-backdrop,[data-lesson-pause]'))closeLesson();
  if(event.target.closest('[data-lesson-submit]')&&activeLesson){
    const activity=LESSONS[activeLesson].activities[state.academy[activeLesson].step];
    const response=activity.type==='lesson'?'reviewed':activity.type==='choice'?$('input[name="academy-answer"]:checked')?.value:$('#academy-answer')?.value;
    if(!String(response??'').trim()){notify('Enter or select an answer before grading.');return}
    const submission=submitAcademyResponse(state.academy,activeLesson,response);state.academy=submission.academy;saveState();recordInteraction('academy',submission.result.passed?'answer-pass':'answer-retry');renderLesson();
  }
  if(event.target.closest('[data-lesson-next]')&&activeLesson){const moved=advanceLesson(state.academy,activeLesson);state.academy=moved.academy;saveState();if(moved.advanced){recordInteraction('academy','activity-complete');renderLesson()}else notify('Warden blocked progress: pass this activity first.')}
  if(event.target.closest('[data-lesson-back]')&&activeLesson){state.academy=previousLessonActivity(state.academy,activeLesson);saveState();renderLesson()}
  if(event.target.closest('[data-lesson-finish]')&&activeLesson){const result=completeAcademyLesson(state.academy,activeLesson);state.academy=result.academy;saveState();if(result.completed){recordInteraction('academy','lesson-complete');render();closeLesson('Lesson complete. Schedule checkpoint saved locally.')}else{recordFinding('academy-premature-completion',activeLesson);notify('Warden blocked completion: finish every lesson step.')}}
  if(event.target.closest('[data-enable-alerts]')){if('Notification'in window){Notification.requestPermission().then(permission=>{state.alertsEnabled=permission==='granted';saveState();render();notify(state.alertsEnabled?'Device alerts enabled.':'Device alerts remain off. The in-app overdue rail stays active.')})}else notify('Device notifications are unavailable. The in-app overdue rail stays active.')}
  const region=event.target.closest('[data-region]');if(region){state.region=region.dataset.region;saveState();render();notify(`${state.region} intelligence lens active.`)}
  const filter=event.target.closest('[data-filter]');if(filter){$$('[data-filter]').forEach(button=>button.classList.toggle('active',button===filter));renderIntelligence(filter.dataset.filter)}
  const save=event.target.closest('[data-save]');if(save){state.saved=state.saved.includes(save.dataset.save)?state.saved.filter(id=>id!==save.dataset.save):[...state.saved,save.dataset.save];saveState();render()}
  const dismiss=event.target.closest('[data-dismiss]');if(dismiss){state.dismissed=[...state.dismissed,dismiss.dataset.dismiss];saveState();render()}
  const complete=event.target.closest('[data-complete]');if(complete){state.completed=state.completed.includes(complete.dataset.complete)?state.completed.filter(id=>id!==complete.dataset.complete):[...state.completed,complete.dataset.complete];saveState();render()}
  if(event.target.closest('#reset-local')){localStorage.removeItem(STORAGE);clearTelemetry();state={...initial,academy:normalizeAcademy({}),completed:[],saved:[],dismissed:[]};$('#scene-index').hidden=true;render();notify('Local Daily Bread state and XER telemetry reset.')}
  if(event.target.closest('#open-preferences'))notify('Preferences remain private and local. Use regional and Academy controls in the deck.');
});
document.addEventListener('input',event=>{
  if(event.target.id==='mission-notes'){state.notes=event.target.value;saveState()}
  if(event.target.id==='academy-answer'&&activeLesson){state.academy=saveAcademyDraft(state.academy,activeLesson,event.target.value);saveState()}
});
document.addEventListener('keydown',event=>{
  const keyClass=safeKeyClass(event);if(keyClass)recordInteraction('key',keyClass);
  if(event.key==='Escape'&&!$('#tutorial-panel').hidden){closeTutorial(false);return}
  if(event.key==='Escape'&&!$('#scene-index').hidden){$('#scene-index').hidden=true;return}
  if(event.target.matches('textarea,input'))return;
  if(event.key==='ArrowRight'||event.key==='PageDown')setScene(active+1);
  if(event.key==='ArrowLeft'||event.key==='PageUp')setScene(active-1);
  if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openIndex()}
});

window.addEventListener('error',event=>recordFinding('runtime-error',event.message));
window.addEventListener('unhandledrejection',()=>recordFinding('unhandled-promise','Promise rejection withheld'));

const hashIndex=scenes.findIndex(scene=>`#${scene.id}`===location.hash);
render();tick();enforceSchedule();setScene(hashIndex>=0?hashIndex:0,false);setInterval(tick,30000);
if(!state.tutorialSeen&&!location.hash)setTimeout(()=>openTutorial(),700);
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
