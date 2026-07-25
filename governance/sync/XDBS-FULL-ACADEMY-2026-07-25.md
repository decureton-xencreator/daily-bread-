# XDBS Full Academy Runtime

Date: 2026-07-25  
Release: XPS 4.4.0

## Correction

The prior Academy interface was an instructional sample. It exposed no answer field, did not grade work and allowed progression without assessment evidence. XPS 4.4 replaces that false affordance with a full local lesson and assessment engine.

## Runtime contract

- Every course declares complete activities, point values, a passing score and XP.
- Assessable activities require an answer before grading.
- Failed work receives feedback and remains blocked.
- Progression requires a passing result for the current activity.
- Completion requires every activity to pass and the total score to meet the course threshold.
- Drafts, answers, attempts, scores, XP and exact position persist locally for Resume Anywhere.
- Daily completion starts a fresh session the next time the course opens.

## Grading

- Typing: exact target comparison, edit-distance accuracy, errors and WPM.
- Spanish: accepted translations, choice checks and grammatical pattern validation; English translations accompany Spanish instruction.
- Applied AI: truth-state selection and minimum-evidence constructed responses.
- Finance: numeric tolerance plus complete cash-conversion reasoning.

## Privacy

Answer text is stored only in the user’s browser to support grading and resume. XER telemetry receives aggregate actions such as pass, retry and completion, never answer text, field values or raw printable keystrokes.
