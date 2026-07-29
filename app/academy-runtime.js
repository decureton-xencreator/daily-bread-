import{voiceGate}from'./voice-runtime.js';
export const ACADEMY_SCHEDULE = {
  timezone: 'America/New_York',
  dailyMinimum: [
    {courseId: 'typing', minutes: 12, label: 'Typing accuracy'},
    {courseId: 'spanish', minutes: 8, label: 'Spanish speaking'}
  ],
  focusRotation: [
    {courseId: 'ai', days: [1, 3, 5], minutes: 18, label: 'Applied AI'},
    {courseId: 'finance', days: [2, 4], minutes: 15, label: 'Financial Intelligence'}
  ],
  dailyOverdueHours: 24,
  rotationOverdueHours: 72
};

const typingLine = 'Evidence before confidence. Accuracy before speed.';

export const LESSONS = {
  typing: {
    title: 'Accuracy Before Speed',
    mission: 'Frictionless input',
    minutes: 12,
    passingScore: 80,
    xp: 120,
    activities: [
      {id:'standard',type:'lesson',title:'Set the standard',prompt:'Accuracy is the gate',body:'Place your fingers on the home row. Slow down until every keypress is deliberate. Speed is measured, but it cannot rescue poor accuracy.',points:10},
      {id:'warmup',type:'typing',title:'Warm-up · clean copy',prompt:'Type the line exactly once.',target:typingLine,repetitions:1,minAccuracy:94,points:15},
      {id:'repetition',type:'typing',title:'Clean repetition',prompt:'Type the line exactly three times, each on a new line.',target:typingLine,repetitions:3,minAccuracy:96,points:25},
      {id:'punctuation',type:'typing',title:'Punctuation control',prompt:'Copy this sentence exactly—including capitalization, comma, apostrophe and period.',target:"Warden checks the claim, Xen records the proof, and I don't rush.",repetitions:1,minAccuracy:97,points:20},
      {id:'minute',type:'typing',title:'One-minute evidence sprint',prompt:'Type the passage accurately. Your elapsed time and words per minute are measured from your first keypress.',target:'Build with evidence. Verify the result. Record the truth. Resume from the exact continuation. Speed follows control, and control begins with accuracy.',repetitions:1,minAccuracy:95,points:30}
    ]
  },
  spanish: {
    title: 'High-Frequency Speaking Loop',
    mission: 'Everyday fluency',
    minutes: 8,
    passingScore: 80,
    xp: 100,
    activities: [
      {id:'pattern',type:'lesson',title:'Pattern · Quiero + infinitive',prompt:'Quiero means “I want.”',body:'Use Quiero + an infinitive: Quiero aprender — I want to learn. Quiero practicar — I want to practice. Quiero hablar — I want to speak. Read each Spanish sentence aloud twice.',points:10},
      {id:'meaning',type:'choice',title:'Meaning check',prompt:'What does “Quiero aprender español” mean?',options:['I speak Spanish every day','I want to learn Spanish','I learned Spanish yesterday'],answer:'I want to learn Spanish',explanation:'Quiero = I want; aprender = to learn; español = Spanish.',points:15},
      {id:'translate-one',type:'text',title:'Translate into Spanish',prompt:'I want to practice today.',accepted:['quiero practicar hoy','quiero practicar hoy.'],hint:'Start with Quiero. “To practice” is practicar; “today” is hoy.',points:20},
      {id:'translate-two',type:'text',title:'Translate into English',prompt:'Quiero hablar con confianza.',accepted:['i want to speak with confidence','i want to speak confidently','i want to talk with confidence'],hint:'Hablar means “to speak” or “to talk.”',points:15},
      {id:'select',type:'choice',title:'Choose the correct pattern',prompt:'Which sentence says “I want to learn today”?',options:['Quiero aprender hoy.','Quiero aprendí hoy.','Yo querer aprender hoy.'],answer:'Quiero aprender hoy.',explanation:'Quiero is followed by the infinitive aprender.',points:15},
      {id:'create',type:'pattern',title:'Create your own sentence',prompt:'Write one new sentence beginning with “Quiero…”',prefix:'quiero ',minWords:3,hint:'Example: Quiero cocinar esta noche. — I want to cook tonight.',points:25}
    ]
  },
  ai: {
    title: 'Evidence-Based Evaluation',
    mission: 'Build with the system',
    minutes: 18,
    passingScore: 80,
    xp: 150,
    activities: [
      {id:'claim',type:'reflection',title:'Choose one claim',prompt:'State one Xen capability as a user-observable outcome.',minWords:8,hint:'Use: “A user can…” Avoid architectural intent.',points:20},
      {id:'truth',type:'choice',title:'Truth-state classification',prompt:'A feature exists in repository code and passes local tests, but its production endpoint is unavailable. What is the strongest truthful state?',options:['Live','Repository-backed','Production verified'],answer:'Repository-backed',explanation:'Code and tests support Repository-backed; Live requires verified production behavior.',points:20},
      {id:'evidence',type:'reflection',title:'Trace the evidence',prompt:'List the source, dependency, validation and deployment evidence you would inspect.',minWords:12,hint:'Name all four evidence classes explicitly.',points:30},
      {id:'verdict',type:'reflection',title:'Issue a verdict',prompt:'Give the truth state, the evidence supporting it and the next proof required.',minWords:15,hint:'A strong verdict separates what is proven from what remains blocked.',points:30}
    ]
  },
  finance: {
    title: 'Margin and Cash Conversion',
    mission: 'Money Tree',
    minutes: 15,
    passingScore: 80,
    xp: 140,
    activities: [
      {id:'concept',type:'lesson',title:'Gross profit and margin',prompt:'Know the distinction',body:'Gross profit = price − direct costs. Gross margin % = gross profit ÷ price × 100. Cash conversion asks when money leaves and when it returns.',points:10},
      {id:'profit',type:'number',title:'Calculate gross profit',prompt:'An offer sells for $10,000. Materials are $4,000, labor is $2,000 and delivery is $500. What is gross profit?',answer:3500,tolerance:0,unit:'$',points:25},
      {id:'margin',type:'number',title:'Calculate gross margin',prompt:'Using the same offer, what is gross margin percentage? Round to one decimal if needed.',answer:35,tolerance:.1,unit:'%',points:25},
      {id:'cash',type:'reflection',title:'Protect cash conversion',prompt:'Name when cash leaves, when it returns, one delay risk and one protective action.',minWords:15,hint:'Address all four elements.',points:40}
    ]
  }
};

const isoDay = date => new Intl.DateTimeFormat('en-CA', {
  timeZone: ACADEMY_SCHEDULE.timezone, year: 'numeric', month: '2-digit', day: '2-digit'
}).format(date);

const clean = value => String(value ?? '').trim().toLowerCase().replace(/[“”"]/g,'"').replace(/[’]/g,"'").replace(/\s+/g,' ');
const words = value => clean(value).split(' ').filter(Boolean).length;

function levenshtein(a,b){
  const rows=Array.from({length:b.length+1},(_,i)=>[i]);
  rows[0]=Array.from({length:a.length+1},(_,i)=>i);
  for(let i=1;i<=b.length;i++)for(let j=1;j<=a.length;j++)rows[i][j]=b[i-1]===a[j-1]?rows[i-1][j-1]:1+Math.min(rows[i-1][j],rows[i][j-1],rows[i-1][j-1]);
  return rows[b.length][a.length];
}

function typingTarget(activity){
  return Array.from({length:activity.repetitions||1},()=>activity.target).join('\n');
}

export function gradeAcademyResponse(activity,response,elapsedSeconds=0){
  const raw=String(response??''), normalized=clean(raw);
  if(activity.type==='lesson')return{passed:true,score:activity.points,feedback:'Foundation reviewed. Continue to the assessed work.'};
  if(activity.type==='choice'){
    const passed=normalized===clean(activity.answer);
    return{passed,score:passed?activity.points:0,feedback:passed?`Correct. ${activity.explanation||''}`:`Not yet. ${activity.explanation||'Review the pattern and try again.'}`};
  }
  if(activity.type==='text'){
    const passed=activity.accepted.some(answer=>normalized===clean(answer));
    return{passed,score:passed?activity.points:0,feedback:passed?'Correct. Meaning and structure are both intact.':`Not yet. ${activity.hint||'Review and try again.'}`};
  }
  if(activity.type==='pattern'){
    const passed=normalized.startsWith(clean(activity.prefix))&&words(raw)>=activity.minWords;
    return{passed,score:passed?activity.points:0,feedback:passed?'Pattern accepted. Read your sentence aloud once naturally.':`Not yet. ${activity.hint}`};
  }
  if(activity.type==='reflection'){
    const passed=words(raw)>=activity.minWords;
    return{passed,score:passed?activity.points:0,feedback:passed?'Response meets the local evidence rubric.':'Add enough specific evidence to satisfy every part of the prompt.'};
  }
  if(activity.type==='number'){
    const value=Number(raw.replace(/[$,%]/g,''));
    const passed=Number.isFinite(value)&&Math.abs(value-activity.answer)<=activity.tolerance;
    return{passed,score:passed?activity.points:0,feedback:passed?'Correct calculation.':`Not yet. Recheck the formula and direct costs.`};
  }
  if(activity.type==='typing'){
    const target=typingTarget(activity),distance=levenshtein(raw,target),accuracy=Math.max(0,Math.round((1-distance/Math.max(target.length,1))*1000)/10);
    const seconds=Math.max(1,elapsedSeconds),wpm=Math.round((raw.length/5)/(seconds/60));
    const passed=accuracy>=activity.minAccuracy;
    return{passed,score:passed?activity.points:0,accuracy,wpm,errors:distance,feedback:passed?`Pass · ${accuracy}% accuracy · ${wpm} WPM · ${distance} error${distance===1?'':'s'}.`:`Retry · ${accuracy}% accuracy · ${distance} errors. You need ${activity.minAccuracy}% accuracy.`};
  }
  return{passed:false,score:0,feedback:'This activity cannot be graded.'};
}

export function normalizeAcademy(academy = {}) {
  return Object.fromEntries(Object.keys(LESSONS).map(id => {
    const old=academy[id],base=typeof old==='number'?{progress:old}:(old||{});
    const record={
      status:'not-started',step:0,elapsedSeconds:0,completedLessons:0,lastStartedAt:null,lastActiveAt:null,lastCompletedAt:null,
      attempts:0,score:0,xp:0,results:{},responses:{},deferred:[],activityStartedAt:null,...base
    };
    // Repair legacy state where a corrected draft was saved after a failed grade.
    // The learner must explicitly regrade; stale failure evidence must not remain latched.
    const activity=LESSONS[id].activities[record.step];
    const staleFailure=record.results?.[activity?.id];
    const draft=record.responses?.[activity?.id];
    if(staleFailure&&!staleFailure.passed&&String(draft??'').trim()&&gradeAcademyResponse(activity,draft,record.elapsedSeconds).passed){
      const results={...record.results};delete results[activity.id];
      record.results=results;
      record.score=Object.values(results).reduce((sum,item)=>sum+(item.score||0),0);
      record.status='active';
    }
    return[id,record];
  }));
}

export function courseAlert(record,courseId,now=new Date()){
  const daily=ACADEMY_SCHEDULE.dailyMinimum.some(item=>item.courseId===courseId);
  const limit=(daily?ACADEMY_SCHEDULE.dailyOverdueHours:ACADEMY_SCHEDULE.rotationOverdueHours)*3600000;
  const stamp=record.lastCompletedAt||record.lastActiveAt;
  if(!stamp)return{level:daily?'overdue':'due',ageHours:null,label:daily?'OVERDUE · NO SESSION RECORDED':'DUE · NO SESSION RECORDED'};
  const ageHours=Math.floor((now-new Date(stamp))/3600000);
  const completedToday=record.lastCompletedAt&&isoDay(new Date(record.lastCompletedAt))===isoDay(now);
  if(daily&&completedToday)return{level:'clear',ageHours,label:'TODAY COMPLETE'};
  if((now-new Date(stamp))>=limit)return{level:'overdue',ageHours,label:`OVERDUE · ${ageHours}H INACTIVE`};
  return{level:'due',ageHours,label:daily?'DUE TODAY':`ACTIVE · ${ageHours}H AGO`};
}

export function academyAlerts(academy,now=new Date()){
  const normalized=normalizeAcademy(academy);
  return Object.entries(normalized).map(([id,record])=>({courseId:id,...courseAlert(record,id,now)}));
}

export function startLesson(academy,courseId,now=new Date()){
  const next=normalizeAcademy(academy),current=next[courseId];
  const fresh=current.status==='completed';
  next[courseId]=fresh
    ?{...current,status:'active',step:0,score:0,results:{},responses:{},attempts:0,lastStartedAt:now.toISOString(),lastActiveAt:now.toISOString(),activityStartedAt:now.toISOString()}
    :{...current,status:current.lastStartedAt?'resumed':'active',lastStartedAt:current.lastStartedAt||now.toISOString(),lastActiveAt:now.toISOString(),activityStartedAt:current.activityStartedAt||now.toISOString()};
  return next;
}

export function saveAcademyDraft(academy,courseId,response,now=new Date()){
  const next=normalizeAcademy(academy),current=next[courseId],activity=LESSONS[courseId].activities[current.step];
  const value=String(response),previous=String(current.responses[activity.id]??'');
  const firstTypingKey=activity.type==='typing'&&!previous&&value.length>0;
  const results={...current.results};
  if(previous!==value&&results[activity.id])delete results[activity.id];
  const score=Object.values(results).reduce((sum,item)=>sum+(item.score||0),0);
  next[courseId]={...current,responses:{...current.responses,[activity.id]:value},results,score,status:previous!==value&&current.results[activity.id]?'active':current.status,lastActiveAt:now.toISOString(),activityStartedAt:firstTypingKey?now.toISOString():current.activityStartedAt};
  return next;
}

export function submitAcademyResponse(academy,courseId,response,now=new Date()){
  const next=normalizeAcademy(academy),current=next[courseId],lesson=LESSONS[courseId],activity=lesson.activities[current.step];
  const elapsed=current.activityStartedAt?Math.max(1,Math.round((now-new Date(current.activityStartedAt))/1000)):1;
  const result=gradeAcademyResponse(activity,response,elapsed);
  const results={...current.results,[activity.id]:{...result,attemptedAt:now.toISOString()}};
  const responses={...current.responses,[activity.id]:String(response)};
  const score=Object.values(results).reduce((sum,item)=>sum+(item.score||0),0);
  const deferred=(current.deferred||[]).filter(id=>id!==activity.id);
  next[courseId]={...current,attempts:current.attempts+1,score,results,responses,deferred,status:result.passed?'active':'needs-retry',lastActiveAt:now.toISOString()};
  return{academy:next,result:{...result,canRetry:true,canDefer:lesson.activities.length>1,recovery:result.passed?'continue':'correct-retry-or-defer'}};
}

export function retryAcademyActivity(academy,courseId,now=new Date()){
  const next=normalizeAcademy(academy),current=next[courseId],activity=LESSONS[courseId].activities[current.step];
  const results={...current.results};delete results[activity.id];
  const score=Object.values(results).reduce((sum,item)=>sum+(item.score||0),0);
  next[courseId]={...current,results,score,status:'active',lastActiveAt:now.toISOString(),activityStartedAt:now.toISOString()};
  return next;
}

export function deferAcademyActivity(academy,courseId,now=new Date()){
  const next=normalizeAcademy(academy),current=next[courseId],lesson=LESSONS[courseId],activity=lesson.activities[current.step];
  const deferred=[...new Set([...(current.deferred||[]),activity.id])];
  const nextStep=current.step<lesson.activities.length-1?current.step+1:lesson.activities.findIndex(item=>!current.results[item.id]?.passed&&item.id!==activity.id);
  if(nextStep<0)return{academy:next,deferred:false};
  next[courseId]={...current,deferred,step:nextStep,status:'active',lastActiveAt:now.toISOString(),activityStartedAt:now.toISOString()};
  return{academy:next,deferred:true};
}

export function advanceLesson(academy,courseId,now=new Date()){
  const next=normalizeAcademy(academy),lesson=LESSONS[courseId],current=next[courseId],activity=lesson.activities[current.step];
  if(!current.results[activity.id]?.passed)return{academy:next,advanced:false};
  next[courseId]={...current,step:Math.min(lesson.activities.length-1,current.step+1),status:'active',lastActiveAt:now.toISOString(),activityStartedAt:now.toISOString()};
  return{academy:next,advanced:true};
}

export function previousLessonActivity(academy,courseId,now=new Date()){
  const next=normalizeAcademy(academy),current=next[courseId];
  next[courseId]={...current,step:Math.max(0,current.step-1),lastActiveAt:now.toISOString(),activityStartedAt:now.toISOString()};
  return next;
}

export function completeAcademyLesson(academy,courseId,now=new Date()){
  const next=normalizeAcademy(academy),lesson=LESSONS[courseId],current=next[courseId];
  const passed=lesson.activities.every(activity=>current.results[activity.id]?.passed);
  const score=current.score||0;
  const spoken=courseId!=='spanish'||voiceGate(next).passed;
  if(!passed||!spoken||score<lesson.passingScore)return{academy:next,completed:false,score,required:lesson.passingScore,voiceGate:courseId==='spanish'?voiceGate(next):null};
  next[courseId]={...current,status:'completed',step:0,elapsedSeconds:0,completedLessons:current.completedLessons+1,progress:Math.min(100,(current.progress||0)+10),xp:(current.xp||0)+lesson.xp,lastActiveAt:now.toISOString(),lastCompletedAt:now.toISOString(),activityStartedAt:null};
  return{academy:next,completed:true,score,xp:lesson.xp};
}
