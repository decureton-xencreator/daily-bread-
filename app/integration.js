const stages=[
  ['sync','SYNC','Reconcile the latest approved repository state.','Current Daily Bread release, capability manifest and continuity record.'],
  ['inherit','INHERIT','Accept only compatible, approved capability outcomes.','Minimized public inheritance; private authority and raw chat remain outside source.'],
  ['classify','CLASSIFY','Label every capability by its truthful operating state.','Live, repository-backed, locally functional, integration-ready, blocked or not implemented.'],
  ['plan','PLAN GATE','Name the bounded outcome, evidence and stop conditions.','One execution slice with an explicit acceptance gate.'],
  ['execute','EXECUTE','Perform the authorized repository-first change.','Working interface, data contract and continuity record.'],
  ['validate','VALIDATE','Test structure, behavior, accessibility and privacy.','Automated checks plus clearly bounded manual acceptance.'],
  ['truth','TRUTH GATE','Reject unsupported completion and deployment claims.','Evidence must support the exact status shown to the user.'],
  ['record','RECORD','Commit durable proof and the next continuation point.','Release record, Warden result and immutable history.'],
  ['respond','RESPOND','Return the useful result with its permanent route.','Verified link, release identity, blockers and next action.']
];
const KEY='xdbs-xip-runtime-v1';
const initial=()=>({active:0,revealed:[],completed:[],failures:[]});
const load=()=>{try{return {...initial(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return initial()}};
const save=s=>localStorage.setItem(KEY,JSON.stringify(s));
const safe=v=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

export function mountIntegrationProcess(){
  const root=document.querySelector('#integration-runtime');if(!root)return;
  let state=load();
  const render=()=>{
    const active=stages[state.active]||stages.at(-1),revealed=state.revealed.includes(active[0]);
    root.innerHTML=`<div class="xip-runway" aria-label="Xen integration lifecycle">${stages.map((s,i)=>`<button data-xip-stage="${i}" class="${i===state.active?'active':''} ${state.completed.includes(s[0])?'complete':''}" aria-current="${i===state.active?'step':'false'}"><i>${state.completed.includes(s[0])?'✓':String(i+1).padStart(2,'0')}</i><span>${s[1]}</span></button>`).join('')}</div>
      <div class="xip-console">
        <article class="xip-notify"><span class="eyebrow">NOTIFY · CURRENT GATE</span><h3>${safe(active[1])}</h3><p>${safe(active[2])}</p><span class="truth repo">Repository-governed</span></article>
        <article class="xip-reveal"><span class="eyebrow">REVEAL · EVIDENCE</span>${revealed?`<h3>Acceptance evidence</h3><p>${safe(active[3])}</p><span class="truth local">Revealed locally</span>`:'<h3>Evidence is intentionally folded.</h3><p>Reveal the gate before taking action. This prevents decorative controls and unsupported completion.</p>'}<button class="quiet small" data-xip-reveal>${revealed?'Evidence revealed ✓':'Reveal evidence'}</button></article>
        <article class="xip-act"><span class="eyebrow">ACT · BOUNDED CONTROL</span><h3>${state.completed.includes(active[0])?'Gate recorded.':'Advance with evidence.'}</h3><p>Progress is stored only in this browser. The repository remains the authority for published status.</p><button class="primary" data-xip-act>${state.completed.includes(active[0])?'Advance to next gate':'Complete current gate'}</button><button class="link-btn" data-xip-reset>Reset local run</button></article>
      </div>
      <div class="xip-warden"><div><span class="eyebrow">WARDEN FAILED-ACTION LEDGER</span><b>${state.failures.length} local event${state.failures.length===1?'':'s'}</b></div><p aria-live="polite">${state.failures.length?`${safe(state.failures[0].stage)} blocked: ${safe(state.failures[0].reason)}. Stored locally.`:'No failed interaction recorded on this device.'}</p></div>`;
  };
  if(!root.dataset.mounted){
    root.dataset.mounted='true';
    root.addEventListener('click',event=>{
      const stage=event.target.closest('[data-xip-stage]');
      if(stage){state.active=Number(stage.dataset.xipStage);save(state);render();return}
      if(event.target.closest('[data-xip-reveal]')){const id=stages[state.active][0];if(!state.revealed.includes(id))state.revealed.push(id);save(state);render();return}
      if(event.target.closest('[data-xip-act]')){
        const current=stages[state.active];
        if(!state.revealed.includes(current[0])){state.failures.unshift({stage:current[1],reason:'evidence was not revealed',at:new Date().toISOString()});state.failures=state.failures.slice(0,8);save(state);render();return}
        if(!state.completed.includes(current[0]))state.completed.push(current[0]);
        if(state.active<stages.length-1)state.active+=1;
        save(state);render();return;
      }
      if(event.target.closest('[data-xip-reset]')){state=initial();save(state);render()}
    });
  }
  render();
}
