const DAY=86400000;
function isoDay(value){return value?new Date(value).toISOString().slice(0,10):''}
export function hydrateAcademy(state,courses){
 const existing=state.academy&&typeof state.academy==='object'?state.academy:{};
 const academy={...existing};
 for(const c of courses)academy[c.id]={progress:c.progress,xp:c.xp,score:c.score,streak:c.streak,lesson:c.lesson,mission:c.mission,status:'Local browser persistence',sessions:0,completedLessons:0,lastResumedAt:null,lastCompletedAt:null,...existing[c.id]};
 return {...state,academy};
}
export function courseView(state,course){return state.academy?.[course.id]||hydrateAcademy(state,[course]).academy[course.id]}
export function resumeCourse(state,course,now=new Date()){
 const next=hydrateAcademy(state,[course]),current=next.academy[course.id];
 next.academy={...next.academy,[course.id]:{...current,sessions:(current.sessions||0)+1,lastResumedAt:now.toISOString(),status:'Active locally'}};
 return next;
}
export function completeLesson(state,course,now=new Date()){
 const next=hydrateAcademy(state,[course]),current=next.academy[course.id],today=isoDay(now),previous=isoDay(current.lastCompletedAt);
 const yesterday=isoDay(new Date(now.getTime()-DAY));
 const streak=previous===today?current.streak||1:previous===yesterday?(current.streak||0)+1:1;
 next.academy={...next.academy,[course.id]:{...current,progress:Math.min(100,(current.progress||0)+5),xp:(current.xp||0)+50,streak,completedLessons:(current.completedLessons||0)+1,lastCompletedAt:now.toISOString(),lastResumedAt:current.lastResumedAt||now.toISOString(),status:'Lesson checkpoint saved locally'}};
 return next;
}
