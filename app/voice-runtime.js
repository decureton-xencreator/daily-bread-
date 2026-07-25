export const VOICE_RELEASE = 'XAVR-1.0.0';
export const VOICE_PASSING_SCORE = 80;
export const VOICE_WEIGHTS = Object.freeze({
  phraseCompletion: 25,
  wordAccuracy: 30,
  pronunciationSimilarity: 20,
  pacing: 10,
  fluency: 10,
  hesitation: 5
});

export const SPANISH_VOICE_ACTIVITIES = Object.freeze([
  {id:'voice-repeat',mode:'listen-repeat',title:'Listen and repeat',spanish:'Quiero aprender español.',english:'I want to learn Spanish.',required:true},
  {id:'voice-guided',mode:'guided-speaking',title:'Guided speaking',spanish:'Quiero practicar hoy.',english:'I want to practice today.',required:true},
  {id:'voice-recall',mode:'recall',title:'Recall without text',spanish:'Quiero hablar con confianza.',english:'I want to speak with confidence.',required:true},
  {id:'voice-build',mode:'sentence-construction',title:'Sentence construction',spanish:'Quiero aprender, practicar y hablar.',english:'I want to learn, practice, and speak.',required:true},
  {id:'voice-dialogue',mode:'mini-dialogue',title:'Mini-dialogue',spanish:'¿Qué quieres hacer? Quiero practicar español.',english:'What do you want to do? I want to practice Spanish.',required:true},
  {id:'voice-lab',mode:'conversation-lab',title:'Conversation lab',spanish:'Hoy quiero hablar español con confianza.',english:'Today I want to speak Spanish with confidence.',required:true}
]);

const clean = value => String(value ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLocaleLowerCase('es')
  .replace(/[¿?¡!.,;:()[\]"']/g,' ')
  .replace(/\s+/g,' ').trim();
const tokens = value => clean(value).split(' ').filter(Boolean);
const clamp = value => Math.max(0,Math.min(100,Math.round(value)));

function alignWords(expected,heard){
  const a=tokens(expected),b=tokens(heard),rows=Array.from({length:a.length+1},()=>Array(b.length+1));
  rows[0][0]={cost:0,ops:[]};
  for(let i=1;i<=a.length;i++)rows[i][0]={cost:i,ops:[...rows[i-1][0].ops,{kind:'omitted',expected:a[i-1]}]};
  for(let j=1;j<=b.length;j++)rows[0][j]={cost:j,ops:[...rows[0][j-1].ops,{kind:'added',heard:b[j-1]}]};
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
    const same=a[i-1]===b[j-1];
    const options=[
      {cost:rows[i-1][j-1].cost+(same?0:1),ops:[...rows[i-1][j-1].ops,{kind:same?'correct':'replace',expected:a[i-1],heard:b[j-1]}]},
      {cost:rows[i-1][j].cost+1,ops:[...rows[i-1][j].ops,{kind:'omitted',expected:a[i-1]}]},
      {cost:rows[i][j-1].cost+1,ops:[...rows[i][j-1].ops,{kind:'added',heard:b[j-1]}]}
    ];
    rows[i][j]=options.sort((x,y)=>x.cost-y.cost)[0];
  }
  return rows[a.length][b.length];
}

export function scoreVoiceAssessment({target,transcript,durationMs=0,hesitationCount=0,recognitionConfidence=null,providerPronunciation=null,provider='browser-local'}){
  const alignment=alignWords(target,transcript);
  const expected=tokens(target),heard=tokens(transcript);
  const correct=alignment.ops.filter(x=>x.kind==='correct').map(x=>x.expected);
  const omitted=alignment.ops.filter(x=>x.kind==='omitted').map(x=>x.expected);
  const added=alignment.ops.filter(x=>x.kind==='added').map(x=>x.heard);
  const replacements=alignment.ops.filter(x=>x.kind==='replace');
  const completion=clamp(((expected.length-omitted.length)/Math.max(1,expected.length))*100);
  const wordAccuracy=clamp((correct.length/Math.max(1,expected.length))*100);
  const seconds=Math.max(.5,durationMs/1000);
  const wordsPerMinute=heard.length/(seconds/60);
  const pacing=clamp(100-Math.abs(wordsPerMinute-105)*.65);
  const fluency=clamp(100-(Math.max(0,hesitationCount)*14)-(replacements.length*7));
  const hesitation=clamp(100-Math.max(0,hesitationCount)*22);
  const providerSupported=Number.isFinite(providerPronunciation);
  const pronunciationSimilarity=providerSupported?clamp(providerPronunciation):wordAccuracy;
  const weighted=completion*.25+wordAccuracy*.30+pronunciationSimilarity*.20+pacing*.10+fluency*.10+hesitation*.05;
  const overallScore=clamp(weighted);
  const needsRetry=[...new Set([...omitted,...replacements.map(x=>x.expected)])];
  const mainCorrection=needsRetry.length
    ?`Focus on ${needsRetry.slice(0,2).join(' and ')}; say each word clearly, then reconnect the phrase.`
    :added.length?`Remove the extra ${added.slice(0,2).join(' and ')} and repeat the exact phrase.`
    :pacing<70?'Slow slightly and keep an even rhythm across the phrase.'
    :'Keep the same wording and connect it in one natural breath.';
  return {
    schema:'xen.academy.voice-assessment.v1',
    overallScore,passed:overallScore>=VOICE_PASSING_SCORE,
    scoring:{weights:VOICE_WEIGHTS,phraseCompletion:completion,wordAccuracy,pronunciationSimilarity,pacing,fluency,hesitation},
    evidence:{transcript,recognitionConfidence:Number.isFinite(recognitionConfidence)?recognitionConfidence:null,durationMs,wordsPerMinute:Math.round(wordsPerMinute),provider},
    wordFeedback:{correct,needsRetry,omitted,added,replacements},
    pronunciation:{quality:providerSupported?'provider-assisted':'recognition-derived proxy',phonemeLevel:false},
    mainCorrection,
    retryExercise:needsRetry.length?`Say slowly: ${needsRetry.join(' · ')}. Then repeat the full phrase.`:`Repeat once at natural speed without adding words.`
  };
}

export function saveVoiceEvidence(academy,activityId,result,attemptMeta={}){
  const next=structuredClone(academy||{}),course=next.spanish||(next.spanish={});
  const voice=course.voice||{attempts:{},best:{},latest:{},disabled:false};
  const prior=voice.attempts[activityId]||[];
  const evidence={
    ...result,
    attempt:prior.length+1,
    attemptedAt:attemptMeta.attemptedAt||new Date().toISOString(),
    recordingRetained:false,
    audioTransmitted:Boolean(attemptMeta.audioTransmitted)
  };
  voice.attempts[activityId]=[...prior,evidence];
  voice.latest[activityId]=evidence;
  if(!voice.best[activityId]||evidence.overallScore>voice.best[activityId].overallScore)voice.best[activityId]=evidence;
  course.voice=voice;
  course.lastActiveAt=evidence.attemptedAt;
  return next;
}

export function voiceGate(academy,activities=SPANISH_VOICE_ACTIVITIES){
  const best=academy?.spanish?.voice?.best||{};
  const missing=activities.filter(x=>x.required&&!best[x.id]?.passed).map(x=>x.id);
  return {passed:missing.length===0,missing,required:activities.filter(x=>x.required).length,passedCount:activities.filter(x=>best[x.id]?.passed).length};
}

export function createProviderAdapter(env=globalThis){
  const Recognition=env.SpeechRecognition||env.webkitSpeechRecognition;
  return {
    id:'browser-native',
    labels:{capture:'browser-supported',transcription:Recognition?'browser-supported':'unavailable',pronunciation:'recognition-derived proxy',tts:env.speechSynthesis?'browser-supported':'unavailable'},
    async requestCapture(){
      if(!env.navigator?.mediaDevices?.getUserMedia)throw Object.assign(new Error('Microphone capture is unavailable in this browser.'),{code:'UNAVAILABLE'});
      return env.navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    },
    createRecognition(){
      if(!Recognition)return null;
      const recognition=new Recognition();recognition.lang='es-ES';recognition.interimResults=true;recognition.continuous=true;recognition.maxAlternatives=1;return recognition;
    },
    speak(text,rate=1){
      if(!env.speechSynthesis||!env.SpeechSynthesisUtterance)return false;
      env.speechSynthesis.cancel();const utterance=new env.SpeechSynthesisUtterance(text);utterance.lang='es-ES';utterance.rate=rate;env.speechSynthesis.speak(utterance);return true;
    }
  };
}

