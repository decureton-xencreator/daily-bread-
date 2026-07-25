import assert from 'node:assert/strict';
import {
  LESSONS,normalizeAcademy,academyAlerts,startLesson,saveAcademyDraft,gradeAcademyResponse,
  submitAcademyResponse,advanceLesson,previousLessonActivity,completeAcademyLesson
} from '../app/academy-runtime.js';
import {
  SPANISH_VOICE_ACTIVITIES,scoreVoiceAssessment,saveVoiceEvidence
} from '../app/voice-runtime.js';

const now=new Date('2026-07-25T16:00:00-04:00');
let academy=normalizeAcademy({});
assert.equal(Object.keys(academy).length,4);
assert.equal(academyAlerts(academy,now).filter(item=>item.level==='overdue').length,2);
assert.equal(LESSONS.typing.activities.length,5);
assert.equal(LESSONS.spanish.activities.length,6);

academy=startLesson(academy,'spanish',now);
assert.equal(academy.spanish.status,'active');
academy=saveAcademyDraft(academy,'spanish','reviewed',new Date(now.getTime()+1000));
assert.equal(academy.spanish.responses.pattern,'reviewed');

let submitted=submitAcademyResponse(academy,'spanish','reviewed',new Date(now.getTime()+2000));
academy=submitted.academy;
assert.equal(submitted.result.passed,true);
let moved=advanceLesson(academy,'spanish',new Date(now.getTime()+3000));
academy=moved.academy;
assert.equal(moved.advanced,true);
assert.equal(academy.spanish.step,1);

submitted=submitAcademyResponse(academy,'spanish','wrong',new Date(now.getTime()+4000));
academy=submitted.academy;
assert.equal(submitted.result.passed,false);
moved=advanceLesson(academy,'spanish',new Date(now.getTime()+5000));
assert.equal(moved.advanced,false);
assert.equal(moved.academy.spanish.step,1);

const responses=[
  'I want to learn Spanish',
  'Quiero practicar hoy.',
  'I want to speak with confidence',
  'Quiero aprender hoy.',
  'Quiero cocinar esta noche'
];
for(const response of responses){
  submitted=submitAcademyResponse(academy,'spanish',response,new Date(now.getTime()+6000+academy.spanish.step*1000));
  academy=submitted.academy;
  assert.equal(submitted.result.passed,true);
  if(academy.spanish.step<LESSONS.spanish.activities.length-1)academy=advanceLesson(academy,'spanish').academy;
}
assert.equal(academy.spanish.score,100);
const voiceBlocked=completeAcademyLesson(academy,'spanish',new Date(now.getTime()+19000));
assert.equal(voiceBlocked.completed,false);
assert.equal(voiceBlocked.voiceGate.passed,false);
const passingVoice=scoreVoiceAssessment({
  target:'Quiero practicar hoy.',
  transcript:'Quiero practicar hoy.',
  durationMs:2200,
  recognitionConfidence:.94
});
for(const activity of SPANISH_VOICE_ACTIVITIES){
  academy=saveVoiceEvidence(academy,activity.id,passingVoice,{attemptedAt:new Date(now.getTime()+19500).toISOString()});
}
const result=completeAcademyLesson(academy,'spanish',new Date(now.getTime()+20000));
assert.equal(result.completed,true);
assert.equal(result.academy.spanish.completedLessons,1);
assert.equal(result.academy.spanish.xp,100);
assert.equal(academyAlerts(result.academy,new Date(now.getTime()+21000)).find(item=>item.courseId==='spanish').level,'clear');

const exact='Evidence before confidence. Accuracy before speed.';
const typingGrade=gradeAcademyResponse(LESSONS.typing.activities[1],exact,60);
assert.equal(typingGrade.passed,true);
assert.equal(typingGrade.accuracy,100);
assert.equal(typingGrade.wpm,10);
const badTyping=gradeAcademyResponse(LESSONS.typing.activities[1],'Evidence before speed.',60);
assert.equal(badTyping.passed,false);

academy=previousLessonActivity(academy,'spanish');
assert.equal(academy.spanish.step,4);
const blocked=completeAcademyLesson(normalizeAcademy({}),'typing',now);
assert.equal(blocked.completed,false);
console.log('XPS 4.4 full Academy grading, evidence, scoring, XP, persistence and neglect tests passed');
