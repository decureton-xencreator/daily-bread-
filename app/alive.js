const mediaCatalog={
 film:{label:'CINEMA MODE',videoId:'6ZfuNTqbHE8',url:'https://www.youtube.com/watch?v=6ZfuNTqbHE8',cta:'Open trailer',alt:'Official Avengers: Infinity War trailer thumbnail'},
 music:{label:'SONG OF THE DAY',videoId:'bEeaS6fuUoA',url:'https://www.youtube.com/watch?v=bEeaS6fuUoA',cta:'Open full video',alt:'Bill Withers Lovely Day official video thumbnail'},
 longform:{label:'OPERATOR STORIES',videoId:'UF8uR6Z6KLc',url:'https://www.youtube.com/watch?v=UF8uR6Z6KLc',cta:'Open talk',alt:'Steve Jobs Stanford commencement address thumbnail'}
};
const courseCatalog={
 ai:{name:'Applied AI',mission:'Build with the system',lesson:'Repository-backed execution',minutes:18,prompt:'Open one live capability. Trace its source, dependency, validation evidence, and continuation point.'},
 finance:{name:'Financial Intelligence',mission:'Money Tree',lesson:'Margin and cash conversion',minutes:15,prompt:'Choose one offer. Calculate price, direct cost, gross margin, and the cash-conversion risk.'},
 spanish:{name:'Spanish',mission:'Everyday fluency',lesson:'High-frequency speaking loop',minutes:8,prompt:'Speak ten high-frequency phrases aloud twice: first slowly, then at natural conversational speed.'},
 typing:{name:'Typing',mission:'Frictionless input',lesson:'Accuracy before speed',minutes:12,prompt:'Type slowly enough to protect accuracy. Reset after each error and finish with one clean minute.'}
};
let lessonTimer=null,lessonSeconds=0,activeCourse=null;
const activePlayers=new Map();
const q=(s,r=document)=>r.querySelector(s);
function aliveToast(message){const region=q('#toast-region');if(!region)return;const node=document.createElement('div');node.className='toast';node.textContent=message;region.append(node);setTimeout(()=>node.remove(),2800)}
function decorateGlobe(){const stage=q('.globe-stage');if(!stage||stage.dataset.holo==='1')return;stage.dataset.holo='1';stage.insertAdjacentHTML('afterbegin','<div class="chamber-hud hud-left" aria-hidden="true"><b>WORLD NODE</b><span>LIVE ORIENTATION</span><i></i><span>PRIVACY: LOCAL</span></div><div class="chamber-hud hud-right" aria-hidden="true"><b>XEN GLOBE</b><span>ORBITAL LENS 04</span><i></i><span>STATUS: ALIVE</span></div>');const world=q('.world',stage);world?.insertAdjacentHTML('beforeend','<span class="holo-continent c1"></span><span class="holo-continent c2"></span><span class="holo-continent c3"></span><span class="latitude-lines"></span><span class="globe-scan"></span>')}
function decorateEntertainment(){document.querySelectorAll('.media-card').forEach((card,index)=>{const id=['film','music','longform'][index],item=mediaCatalog[id];if(!item||card.dataset.alive==='1')return;card.dataset.alive='1';card.dataset.media=id;const original=[...card.childNodes];const body=document.createElement('div');body.className='media-body';original.forEach(node=>body.append(node));const thumb=document.createElement('div');thumb.className='media-thumb';thumb.innerHTML='<img src="https://i.ytimg.com/vi/'+item.videoId+'/hqdefault.jpg" alt="'+item.alt+'" loading="lazy" referrerpolicy="no-referrer"><button class="media-play" data-preview="'+id+'" aria-label="Play preview for '+item.label+'"><span>▶</span><b>PLAY PREVIEW</b></button><em>'+item.label+'</em>';card.prepend(thumb);card.append(body);const actions=body.querySelector('.card-actions');if(actions){const open=document.createElement('a');open.className='quiet button-link';open.href=item.url;open.target='_blank';open.rel='noopener noreferrer';open.textContent=item.cta;open.dataset.mediaOpen=id;actions.prepend(open)}})}
function playerCommand(id,func){const frame=document.querySelector('.media-card[data-media="'+id+'"] iframe');frame?.contentWindow?.postMessage(JSON.stringify({event:'command',func,args:[]}), 'https://www.youtube-nocookie.com')}
function playPreview(id){const item=mediaCatalog[id],card=document.querySelector('.media-card[data-media="'+id+'"]'),thumb=card?.querySelector('.media-thumb');if(!item||!thumb)return;thumb.classList.add('playing');thumb.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+item.videoId+'?autoplay=1&rel=0&enablejsapi=1&playsinline=1" title="'+item.alt+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe><div class="media-console" role="toolbar" aria-label="Xen media controls"><button data-media-pause="'+id+'">Pause</button><button data-media-expand="'+id+'">Expand</button><button data-close-preview="'+id+'">Close</button></div>';activePlayers.set(id,{paused:false,expanded:false});aliveToast('Xen media console online. Pause, expand, or enter cinema mode.')}
function toggleMediaPause(id,button){const state=activePlayers.get(id);if(!state)return;state.paused=!state.paused;playerCommand(id,state.paused?'pauseVideo':'playVideo');button.textContent=state.paused?'Resume':'Pause';button.setAttribute('aria-pressed',String(state.paused))}
async function toggleMediaExpand(id,button){const card=document.querySelector('.media-card[data-media="'+id+'"]'),thumb=card?.querySelector('.media-thumb'),state=activePlayers.get(id);if(!thumb||!state)return;state.expanded=!state.expanded;thumb.classList.toggle('cinema-mode',state.expanded);document.body.classList.toggle('media-cinema-open',state.expanded);button.textContent=state.expanded?'Restore':'Expand';button.setAttribute('aria-pressed',String(state.expanded));if(state.expanded&&thumb.requestFullscreen){try{await thumb.requestFullscreen()}catch{aliveToast('Cinema mode active. Browser fullscreen was unavailable.')}}else if(!state.expanded&&document.fullscreenElement){await document.exitFullscreen().catch(()=>{})}}
function closePreview(id){const card=document.querySelector('.media-card[data-media="'+id+'"]');if(!card)return;document.body.classList.remove('media-cinema-open');activePlayers.delete(id);card.dataset.alive='';const body=card.querySelector('.media-body');card.innerHTML='';if(body){[...body.childNodes].forEach(node=>card.append(node))}decorateEntertainment()}
function openLesson(id){const course=courseCatalog[id];if(!course)return;activeCourse=id;lessonSeconds=course.minutes*60;const backdrop=q('.drawer-backdrop'),body=q('#drawer-body'),title=q('#drawer-title');if(!backdrop||!body)return;backdrop.hidden=false;title.textContent='Academy · Resume Anywhere';body.innerHTML='<section class="drawer-section lesson-surface"><span class="xen-alive-badge"><i></i>XEN IS ALIVE · LOCAL SESSION</span><div class="lesson-hero"><span class="eyebrow">'+course.mission+'</span><h3>'+course.lesson+'</h3><p>'+course.prompt+'</p><div class="lesson-timer" aria-live="polite">'+formatTime(lessonSeconds)+'</div></div><div class="lesson-actions"><button class="primary" data-alive-start>Start '+course.minutes+' min session</button><button class="quiet" data-alive-complete>Complete lesson</button></div><button class="quiet full" data-alive-back>Back to Academy</button><p class="privacy-note">Progress and the resume checkpoint stay on this device.</p></section>';setTimeout(()=>q('[data-alive-start]')?.focus(),30)}
function formatTime(seconds){return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
function toggleLessonTimer(){const button=q('[data-alive-start]'),readout=q('.lesson-timer');if(lessonTimer){clearInterval(lessonTimer);lessonTimer=null;button.textContent='Resume session';return}button.textContent='Pause session';lessonTimer=setInterval(()=>{lessonSeconds=Math.max(0,lessonSeconds-1);if(readout)readout.textContent=formatTime(lessonSeconds);if(!lessonSeconds){clearInterval(lessonTimer);lessonTimer=null;button.textContent='Session complete ✓';aliveToast('Learning session complete. Save the lesson checkpoint.')}},1000)}
function chooseEntertainment(){const cards=[...document.querySelectorAll('.media-card')];if(!cards.length){aliveToast('Restore dismissed recommendations in Preferences to choose again.');return}const card=cards[Math.floor(Math.random()*cards.length)];cards.forEach(x=>x.classList.remove('media-selected'));card.classList.add('media-selected');card.scrollIntoView({behavior:'smooth',block:'center'});aliveToast('Xen chose '+(card.querySelector('h3')?.textContent||'this session')+'.')}

const seriesSections=[...document.querySelectorAll('.module')];
let activeSeries=null;
function setActiveSeries(section){
  if(activeSeries===section)return;
  activeSeries=section;
  seriesSections.forEach(node=>{
    node.classList.toggle('series-active',node===section);
    node.classList.toggle('series-near',node!==section&&Math.abs(seriesSections.indexOf(node)-seriesSections.indexOf(section))===1);
  });
}
const seriesObserver=new IntersectionObserver(entries=>{
  const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
  if(visible[0])setActiveSeries(visible[0].target);
},{rootMargin:'-22% 0px -34% 0px',threshold:[0,.18,.35,.55,.75]});
seriesSections.forEach(section=>seriesObserver.observe(section));
if(seriesSections[0])setActiveSeries(seriesSections[0]);

const observer=new MutationObserver(()=>{decorateEntertainment();decorateGlobe()});observer.observe(document.documentElement,{subtree:true,childList:true});decorateEntertainment();decorateGlobe();
document.addEventListener('click',event=>{const preview=event.target.closest('[data-preview]');if(preview){event.preventDefault();playPreview(preview.dataset.preview)}const pause=event.target.closest('[data-media-pause]');if(pause){event.preventDefault();toggleMediaPause(pause.dataset.mediaPause,pause)}const expand=event.target.closest('[data-media-expand]');if(expand){event.preventDefault();toggleMediaExpand(expand.dataset.mediaExpand,expand)}const close=event.target.closest('[data-close-preview]');if(close){event.preventDefault();closePreview(close.dataset.closePreview)}const course=event.target.closest('[data-course]');if(course)setTimeout(()=>openLesson(course.dataset.course),0);if(event.target.closest('[data-action="choose-entertainment"]'))setTimeout(chooseEntertainment,0);if(event.target.closest('[data-alive-start]'))toggleLessonTimer();if(event.target.closest('[data-alive-complete]')){if(activeCourse){document.querySelector('[data-lesson-complete="'+activeCourse+'"]')?.click();aliveToast(courseCatalog[activeCourse].name+' checkpoint saved.')}q('.drawer-backdrop').hidden=true;if(lessonTimer)clearInterval(lessonTimer);lessonTimer=null}if(event.target.closest('[data-alive-back]')){q('.drawer-backdrop').hidden=true;document.querySelector('#academy')?.scrollIntoView({behavior:'smooth'});if(lessonTimer)clearInterval(lessonTimer);lessonTimer=null}});
document.documentElement.classList.add('xen-is-alive');


/* XPS 3.0 visible presence and color-entry controls */
const xpsSkins=['cyan','violet','solar','emerald','crimson'];
function installXpsPresence(){
  if(document.querySelector('.xps-color-dock'))return;
  const savedSkin=localStorage.getItem('xps-cinematic-skin')||'cyan';
  document.documentElement.dataset.xpsSkin=xpsSkins.includes(savedSkin)?savedSkin:'cyan';
  const status=document.createElement('div');
  status.className='xps-status';
  status.setAttribute('role','status');
  status.innerHTML='<i></i><b>XPS ACTIVE</b><span>· XEN IS ALIVE</span>';
  document.body.append(status);
  const dock=document.createElement('div');
  dock.className='xps-color-dock';
  dock.setAttribute('role','group');
  dock.setAttribute('aria-label','XPS energy color');
  dock.innerHTML='<span>ENERGY</span>'+xpsSkins.map(s=>'<button class="color-entry" type="button" data-skin="'+s+'" aria-label="Activate '+s+' XPS energy" aria-pressed="'+String(s===document.documentElement.dataset.xpsSkin)+'"></button>').join('');
  document.body.append(dock);
}
function activateXpsSkin(skin){
  if(!xpsSkins.includes(skin))return;
  document.documentElement.dataset.xpsSkin=skin;
  localStorage.setItem('xps-cinematic-skin',skin);
  document.querySelectorAll('.color-entry').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.skin===skin)));
  aliveToast(skin.toUpperCase()+' energy skin active.');
}
document.addEventListener('click',event=>{const entry=event.target.closest('.color-entry');if(entry)activateXpsSkin(entry.dataset.skin)});
installXpsPresence();

document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement)return;document.querySelectorAll('.media-thumb.cinema-mode').forEach(thumb=>{thumb.classList.remove('cinema-mode');const button=thumb.querySelector('[data-media-expand]');if(button){button.textContent='Expand';button.setAttribute('aria-pressed','false')}const id=thumb.closest('.media-card')?.dataset.media;if(id&&activePlayers.has(id))activePlayers.get(id).expanded=false});document.body.classList.remove('media-cinema-open')});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const active=document.querySelector('.media-thumb.cinema-mode');const id=active?.closest('.media-card')?.dataset.media;if(id)toggleMediaExpand(id,active.querySelector('[data-media-expand]'))}});
function installLivingLight(){if(document.querySelector('.xps-light-field'))return;const field=document.createElement('div');field.className='xps-light-field';field.setAttribute('aria-hidden','true');field.innerHTML='<i class="aurora a1"></i><i class="aurora a2"></i><i class="aurora a3"></i><b class="energy-rail r1"></b><b class="energy-rail r2"></b>';document.body.prepend(field);window.addEventListener('pointermove',event=>{document.documentElement.style.setProperty('--xps-pointer-x',event.clientX+'px');document.documentElement.style.setProperty('--xps-pointer-y',event.clientY+'px')},{passive:true})}
installLivingLight();
