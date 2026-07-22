const mediaCatalog={
 film:{mark:'◉',label:'CINEMA MODE',url:'https://www.justwatch.com/us',cta:'Find a title'},
 music:{mark:'♫',label:'SONG OF THE DAY',url:'https://www.youtube.com/results?search_query=Bill+Withers+Lovely+Day+official',cta:'Play song'},
 longform:{mark:'◈',label:'OPERATOR STORIES',url:'https://www.youtube.com/results?search_query=founder+postmortem+what+failed+and+recovered',cta:'Browse interviews'}
};
const courseCatalog={
 ai:{name:'Applied AI',mission:'Build with the system',lesson:'Repository-backed execution',minutes:18,prompt:'Open one live capability. Trace its source, dependency, validation evidence, and continuation point.'},
 finance:{name:'Financial Intelligence',mission:'Money Tree',lesson:'Margin and cash conversion',minutes:15,prompt:'Choose one offer. Calculate price, direct cost, gross margin, and the cash-conversion risk.'},
 spanish:{name:'Spanish',mission:'Everyday fluency',lesson:'High-frequency speaking loop',minutes:8,prompt:'Speak ten high-frequency phrases aloud twice: first slowly, then at natural conversational speed.'},
 typing:{name:'Typing',mission:'Frictionless input',lesson:'Accuracy before speed',minutes:12,prompt:'Type slowly enough to protect accuracy. Reset after each error and finish with one clean minute.'}
};
let lessonTimer=null,lessonSeconds=0,activeCourse=null;
const q=(s,r=document)=>r.querySelector(s);
function aliveToast(message){const region=q('#toast-region');if(!region)return;const node=document.createElement('div');node.className='toast';node.textContent=message;region.append(node);setTimeout(()=>node.remove(),2800)}
function decorateEntertainment(){
 document.querySelectorAll('.media-card').forEach((card,index)=>{
  const id=['film','music','longform'][index],item=mediaCatalog[id];if(!item||card.dataset.alive==='1')return;
  card.dataset.alive='1';card.dataset.media=id;
  const original=[...card.childNodes];const body=document.createElement('div');body.className='media-body';original.forEach(node=>body.append(node));
  const thumb=document.createElement('div');thumb.className='media-thumb';thumb.dataset.mark=item.mark;thumb.innerHTML='<span>'+item.label+'</span>';
  card.prepend(thumb);card.append(body);
  const actions=body.querySelector('.card-actions');if(actions){const open=document.createElement('a');open.className='quiet button-link';open.href=item.url;open.target='_blank';open.rel='noopener noreferrer';open.textContent=item.cta;open.dataset.mediaOpen=id;actions.prepend(open)}
 });
}
function openLesson(id){
 const course=courseCatalog[id];if(!course)return;activeCourse=id;lessonSeconds=course.minutes*60;
 const backdrop=q('.drawer-backdrop'),body=q('#drawer-body'),title=q('#drawer-title');if(!backdrop||!body)return;
 backdrop.hidden=false;title.textContent='Academy · Resume Anywhere';
 body.innerHTML='<section class="drawer-section lesson-surface"><span class="xen-alive-badge"><i></i>XEN IS ALIVE · LOCAL SESSION</span><div class="lesson-hero"><span class="eyebrow">'+course.mission+'</span><h3>'+course.lesson+'</h3><p>'+course.prompt+'</p><div class="lesson-timer" aria-live="polite">'+formatTime(lessonSeconds)+'</div></div><div class="lesson-actions"><button class="primary" data-alive-start>Start '+course.minutes+' min session</button><button class="quiet" data-alive-complete>Complete lesson</button></div><button class="quiet full" data-alive-back>Back to Academy</button><p class="privacy-note">Progress and the resume checkpoint stay on this device.</p></section>';
 setTimeout(()=>q('[data-alive-start]')?.focus(),30);
}
function formatTime(seconds){return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
function toggleLessonTimer(){
 const button=q('[data-alive-start]'),readout=q('.lesson-timer');if(lessonTimer){clearInterval(lessonTimer);lessonTimer=null;button.textContent='Resume session';return}
 button.textContent='Pause session';lessonTimer=setInterval(()=>{lessonSeconds=Math.max(0,lessonSeconds-1);if(readout)readout.textContent=formatTime(lessonSeconds);if(!lessonSeconds){clearInterval(lessonTimer);lessonTimer=null;button.textContent='Session complete ✓';aliveToast('Learning session complete. Save the lesson checkpoint.')}},1000)
}
function chooseEntertainment(){
 const cards=[...document.querySelectorAll('.media-card')];if(!cards.length){aliveToast('Restore dismissed recommendations in Preferences to choose again.');return}
 const card=cards[Math.floor(Math.random()*cards.length)];cards.forEach(x=>x.classList.remove('media-selected'));card.classList.add('media-selected');card.scrollIntoView({behavior:'smooth',block:'center'});aliveToast('Xen chose '+(card.querySelector('h3')?.textContent||'this session')+'.')
}
const observer=new MutationObserver(()=>decorateEntertainment());observer.observe(document.documentElement,{subtree:true,childList:true});decorateEntertainment();
document.addEventListener('click',event=>{
 const course=event.target.closest('[data-course]');if(course)setTimeout(()=>openLesson(course.dataset.course),0);
 if(event.target.closest('[data-action="choose-entertainment"]'))setTimeout(chooseEntertainment,0);
 if(event.target.closest('[data-alive-start]'))toggleLessonTimer();
 if(event.target.closest('[data-alive-complete]')){if(activeCourse){const source=document.querySelector('[data-lesson-complete="'+activeCourse+'"]');if(source)source.click();aliveToast(courseCatalog[activeCourse].name+' checkpoint saved.')}q('.drawer-backdrop').hidden=true;if(lessonTimer)clearInterval(lessonTimer);lessonTimer=null}
 if(event.target.closest('[data-alive-back]')){q('.drawer-backdrop').hidden=true;document.querySelector('#academy')?.scrollIntoView({behavior:'smooth'});if(lessonTimer)clearInterval(lessonTimer);lessonTimer=null}
});
document.documentElement.classList.add('xen-is-alive');
