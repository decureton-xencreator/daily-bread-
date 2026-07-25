import{SPANISH_VOICE_ACTIVITIES,VOICE_PASSING_SCORE,createProviderAdapter,scoreVoiceAssessment,saveVoiceEvidence,voiceGate}from'./voice-runtime.js';

const STORAGE='xdbs-command-deck-v2';
const adapter=createProviderAdapter();
let current=0,stream=null,recorder=null,chunks=[],recording=null,recognition=null,transcript='',confidence=null,startedAt=0,hesitations=0,state='ready';
const $=(s,r=document)=>r.querySelector(s);
const escape=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const load=()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{return{}}};
const save=value=>localStorage.setItem(STORAGE,JSON.stringify(value));

function activity(){return SPANISH_VOICE_ACTIVITIES[current]}
function setState(next,message=''){state=next;const status=$('#voice-status');if(status){status.dataset.state=next;status.textContent=message||next.toUpperCase()}}
function stopTracks(){stream?.getTracks().forEach(track=>track.stop());stream=null}
function deleteRecording(){if(recording?.url)URL.revokeObjectURL(recording.url);recording=null;chunks=[];transcript='';confidence=null;$('#voice-replay')?.setAttribute('disabled','');$('#voice-submit')?.setAttribute('disabled','');setState('ready','Recording deleted. Ready when you are.')}
function disableVoice(){deleteRecording();stopTracks();const root=load();root.academy=root.academy||{};root.academy.spanish=root.academy.spanish||{};root.academy.spanish.voice={...(root.academy.spanish.voice||{}),disabled:true};save(root);setState('disabled','Voice disabled. Typed Academy activities remain available.')}

function render(){
  const a=activity(),root=load(),gate=voiceGate(root.academy),best=root.academy?.spanish?.voice?.best?.[a.id],disabled=root.academy?.spanish?.voice?.disabled;
  const mount=$('#voice-assessment-runtime');if(!mount)return;
  mount.innerHTML=`<section class="voice-card" aria-labelledby="voice-title">
    <header><div><small>${escape(a.mode)} · ${adapter.labels.capture}</small><h3 id="voice-title">${escape(a.title)}</h3></div><b>${current+1} / ${SPANISH_VOICE_ACTIVITIES.length}</b></header>
    <p class="voice-spanish" lang="es">${escape(a.spanish)}</p><p class="voice-english">${escape(a.english)}</p>
    <p class="voice-disclosure"><b>Before you start:</b> Xen will capture this attempt only after you press Start Speaking. Audio stays in this browser, is not uploaded, and is deleted when you leave or press Delete. The transcript and score stay locally for Resume Anywhere.</p>
    <div class="voice-model"><button type="button" data-model=".72">Play slow model</button><button type="button" data-model="1">Play natural model</button></div>
    <div id="voice-status" class="voice-status" data-state="${disabled?'disabled':'ready'}" role="status" aria-live="polite">${disabled?'Voice disabled. Typed Academy activities remain available.':'READY · microphone is off'}</div>
    <div class="voice-controls">
      <button id="voice-start" type="button" ${disabled?'disabled':''}>Start Speaking</button><button id="voice-stop" type="button" disabled>Stop Recording</button>
      <button id="voice-replay" type="button" ${recording?'':'disabled'}>Replay</button><button id="voice-retry" type="button">Retry</button>
      <button id="voice-submit" type="button" ${recording?'':'disabled'}>Submit for Assessment</button>
    </div>
    <div class="voice-safety"><button type="button" data-delete>Delete Recording</button><button type="button" data-cancel>Cancel</button><button type="button" data-disable>Disable Voice</button></div>
    ${best?`<div class="voice-result ${best.passed?'pass':'retry'}"><strong>${best.overallScore} / 100 · ${best.passed?'PASS':'RETRY'}</strong><span>${escape(best.mainCorrection)}</span><small>Pronunciation: ${escape(best.pronunciation.quality)} · speech-recognition confidence is separate</small></div>`:''}
    <footer><button type="button" data-prev ${current===0?'disabled':''}>Previous</button><span>${gate.passedCount} / ${gate.required} required activities passed</span><button type="button" data-next ${best?.passed?'':'disabled'}>${current===SPANISH_VOICE_ACTIVITIES.length-1?'Continue lesson':'Continue'}</button></footer>
  </section>`;
}

async function start(){
  deleteRecording();setState('permission','Microphone permission requested after your action…');
  try{
    stream=await adapter.requestCapture();
    const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(type=>MediaRecorder.isTypeSupported(type))||'';
    recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);chunks=[];
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    recorder.onstop=()=>{const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});recording={blob,url:URL.createObjectURL(blob),durationMs:Date.now()-startedAt};stopTracks();$('#voice-replay')?.removeAttribute('disabled');$('#voice-submit')?.removeAttribute('disabled');setState('completed','Recording complete. Replay it or submit for assessment.')};
    recognition=adapter.createRecognition();
    if(recognition){recognition.onresult=e=>{let final='';for(let i=0;i<e.results.length;i++){final+=`${e.results[i][0].transcript} `;confidence=e.results[i][0].confidence||confidence}transcript=final.trim()};recognition.onerror=()=>{};recognition.start()}
    startedAt=Date.now();recorder.start();setState('listening','LISTENING · microphone on');$('#voice-start').disabled=true;$('#voice-stop').disabled=false;
  }catch(error){stopTracks();const denied=error?.name==='NotAllowedError'||error?.name==='SecurityError';setState(denied?'denied':'unavailable',denied?'Microphone denied. Use browser site settings, then press Retry.':'Voice capture unavailable. Typed Academy remains usable.')}
}
function stop(){if(recorder?.state==='recording')recorder.stop();try{recognition?.stop()}catch{}$('#voice-start').disabled=false;$('#voice-stop').disabled=true;setState('processing','Processing locally…')}
function replay(){if(recording?.url)new Audio(recording.url).play()}
function assess(){
  if(!recording)return;
  setState('processing','Assessing transcript, accuracy, pacing and fluency locally…');
  if(!transcript){setState('unavailable','Browser transcription is unavailable for this attempt. Retry in Chrome/Edge or continue with typed Academy work.');return}
  const a=activity(),result=scoreVoiceAssessment({target:a.spanish,transcript,durationMs:recording.durationMs,hesitationCount:hesitations,recognitionConfidence:confidence,provider:'browser-native'});
  const root=load();root.academy=saveVoiceEvidence(root.academy,a.id,result);save(root);
  window.dispatchEvent(new CustomEvent('xen-voice-evidence',{detail:{activityId:a.id,result,gate:voiceGate(root.academy)}}));
  deleteRecording();render();
}

document.addEventListener('click',event=>{
  const button=event.target.closest('#voice-assessment-runtime button');if(!button)return;
  if(button.dataset.model)adapter.speak(activity().spanish,Number(button.dataset.model));
  else if(button.id==='voice-start')start();else if(button.id==='voice-stop')stop();else if(button.id==='voice-replay')replay();else if(button.id==='voice-retry'){deleteRecording();render()}
  else if(button.id==='voice-submit')assess();else if('delete'in button.dataset)deleteRecording();else if('cancel'in button.dataset){deleteRecording();stopTracks()}
  else if('disable'in button.dataset)disableVoice();else if('prev'in button.dataset){current=Math.max(0,current-1);render()}else if('next'in button.dataset){if(current<SPANISH_VOICE_ACTIVITIES.length-1){current++;render()}else window.dispatchEvent(new CustomEvent('xen-voice-complete'))}
});
window.addEventListener('pagehide',()=>{deleteRecording();stopTracks()});
window.addEventListener('xen-open-voice',()=>{current=0;render()});
render();

