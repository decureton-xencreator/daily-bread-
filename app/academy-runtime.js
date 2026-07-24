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

export const LESSONS = {
  typing: {
    title: 'Accuracy Before Speed',
    mission: 'Frictionless input',
    minutes: 12,
    steps: [
      {title: 'Set the standard', body: 'Accuracy is the gate. Slow down until every keypress is deliberate. Speed is not scored until accuracy is stable.'},
      {title: 'Clean repetition', body: 'Type this line three times without correcting by rushing: “Evidence before confidence. Accuracy before speed.”'},
      {title: 'One clean minute', body: 'Finish with one uninterrupted minute. If an error occurs, restart the minute. Completion requires a clean final attempt.'}
    ]
  },
  spanish: {
    title: 'High-Frequency Speaking Loop',
    mission: 'Everyday fluency',
    minutes: 8,
    steps: [
      {title: 'Pattern', body: 'Use “Quiero + infinitive” for what you want to do: Quiero aprender. Quiero practicar. Quiero hablar.'},
      {title: 'Speak', body: 'Say each sentence twice—slowly, then naturally: “Quiero aprender español.” “Quiero practicar hoy.” “Quiero hablar con confianza.”'},
      {title: 'Recall', body: 'Without looking, say all three again and create one new “Quiero…” sentence. Retry before completing if the pattern breaks.'}
    ]
  },
  ai: {
    title: 'Evidence-Based Evaluation',
    mission: 'Build with the system',
    minutes: 18,
    steps: [
      {title: 'Choose one claim', body: 'Select one Xen capability claim. State exactly what a user should be able to do—not what the architecture intends.'},
      {title: 'Trace the evidence', body: 'Find its source file, dependency, validation, deployment evidence and truth state. Missing evidence is a finding, not a failure to hide.'},
      {title: 'Issue a verdict', body: 'Classify the capability: Live, Repository-backed, Locally functional, Integration-ready, Blocked or Not implemented. Record the next proof needed.'}
    ]
  },
  finance: {
    title: 'Margin and Cash Conversion',
    mission: 'Money Tree',
    minutes: 15,
    steps: [
      {title: 'Name the offer', body: 'Choose one offer and record price, direct material cost, direct labor cost and delivery/transaction cost.'},
      {title: 'Calculate', body: 'Gross profit = price − direct costs. Gross margin % = gross profit ÷ price × 100.'},
      {title: 'Protect cash', body: 'Identify when cash leaves, when cash returns and the single assumption most likely to delay conversion. Set one protective action.'}
    ]
  }
};

const isoDay = date => new Intl.DateTimeFormat('en-CA', {
  timeZone: ACADEMY_SCHEDULE.timezone, year: 'numeric', month: '2-digit', day: '2-digit'
}).format(date);

export function normalizeAcademy(academy = {}) {
  return Object.fromEntries(Object.keys(LESSONS).map(id => {
    const old = academy[id];
    const base = typeof old === 'number' ? {progress: old} : (old || {});
    return [id, {
      status: 'not-started', step: 0, elapsedSeconds: 0, completedLessons: 0,
      lastStartedAt: null, lastActiveAt: null, lastCompletedAt: null, ...base
    }];
  }));
}

export function courseAlert(record, courseId, now = new Date()) {
  const daily = ACADEMY_SCHEDULE.dailyMinimum.some(item => item.courseId === courseId);
  const limit = (daily ? ACADEMY_SCHEDULE.dailyOverdueHours : ACADEMY_SCHEDULE.rotationOverdueHours) * 3600000;
  const stamp = record.lastCompletedAt || record.lastActiveAt;
  if (!stamp) return {level: daily ? 'overdue' : 'due', ageHours: null, label: daily ? 'OVERDUE · NO SESSION RECORDED' : 'DUE · NO SESSION RECORDED'};
  const ageHours = Math.floor((now - new Date(stamp)) / 3600000);
  const completedToday = record.lastCompletedAt && isoDay(new Date(record.lastCompletedAt)) === isoDay(now);
  if (daily && completedToday) return {level: 'clear', ageHours, label: 'TODAY COMPLETE'};
  if ((now - new Date(stamp)) >= limit) return {level: 'overdue', ageHours, label: `OVERDUE · ${ageHours}H INACTIVE`};
  return {level: 'due', ageHours, label: daily ? 'DUE TODAY' : `ACTIVE · ${ageHours}H AGO`};
}

export function academyAlerts(academy, now = new Date()) {
  const normalized = normalizeAcademy(academy);
  return Object.entries(normalized).map(([id, record]) => ({courseId: id, ...courseAlert(record, id, now)}));
}

export function startLesson(academy, courseId, now = new Date()) {
  const next = normalizeAcademy(academy);
  const current = next[courseId];
  next[courseId] = {...current, status: current.step ? 'resumed' : 'active', lastStartedAt: current.lastStartedAt || now.toISOString(), lastActiveAt: now.toISOString()};
  return next;
}

export function advanceLesson(academy, courseId, now = new Date()) {
  const next = normalizeAcademy(academy), lesson = LESSONS[courseId], current = next[courseId];
  next[courseId] = {...current, step: Math.min(lesson.steps.length - 1, current.step + 1), status: 'active', lastActiveAt: now.toISOString()};
  return next;
}

export function completeAcademyLesson(academy, courseId, now = new Date()) {
  const next = normalizeAcademy(academy), lesson = LESSONS[courseId], current = next[courseId];
  if (current.step < lesson.steps.length - 1) return {academy: next, completed: false};
  next[courseId] = {...current, status: 'completed', step: 0, elapsedSeconds: 0, completedLessons: current.completedLessons + 1, progress: Math.min(100, (current.progress || 0) + 5), lastActiveAt: now.toISOString(), lastCompletedAt: now.toISOString()};
  return {academy: next, completed: true};
}
