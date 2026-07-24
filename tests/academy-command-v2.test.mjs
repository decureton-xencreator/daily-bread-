import assert from 'node:assert/strict';
import {
  LESSONS, normalizeAcademy, academyAlerts, startLesson, advanceLesson, completeAcademyLesson
} from '../app/academy-runtime.js';

const now = new Date('2026-07-24T16:00:00-04:00');
let academy = normalizeAcademy({});
assert.equal(Object.keys(academy).length, 4);
assert.equal(academyAlerts(academy, now).filter(item => item.level === 'overdue').length, 2);

academy = startLesson(academy, 'spanish', now);
assert.equal(academy.spanish.status, 'active');
academy = advanceLesson(academy, 'spanish', new Date(now.getTime() + 60000));
assert.equal(academy.spanish.step, 1);
academy = advanceLesson(academy, 'spanish', new Date(now.getTime() + 120000));
assert.equal(academy.spanish.step, LESSONS.spanish.steps.length - 1);
const result = completeAcademyLesson(academy, 'spanish', new Date(now.getTime() + 180000));
assert.equal(result.completed, true);
assert.equal(result.academy.spanish.completedLessons, 1);
assert.equal(result.academy.spanish.step, 0);
assert.equal(academyAlerts(result.academy, new Date(now.getTime() + 240000)).find(item => item.courseId === 'spanish').level, 'clear');

const blocked = completeAcademyLesson(normalizeAcademy({}), 'typing', now);
assert.equal(blocked.completed, false);
console.log('Academy Command v2 schedule, resume, completion and neglect tests passed');
