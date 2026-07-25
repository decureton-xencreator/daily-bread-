# Xen Quality Guardian 1.0 — Operating Manual

## Purpose

XQG prevents users from becoming trapped after an error and tests whether Xen controls
actually work. It governs Academy and coaching recovery, buttons, links, entries,
permission paths, persistence, and degraded states. It does not record screen video,
passwords, private messages, raw answers, printable keystrokes, payment data, or
sensitive text.

## Learner recovery

After an incorrect answer, Xen explains the issue and shows three choices:

1. **Correct and retry** clears the current draft and returns focus to the answer.
2. **Show coaching hint** reveals focused help without exposing the answer by default.
3. **Continue · revisit before completion** moves forward while marking the activity
   unfinished. Warden will not award its points or complete the lesson until it passes.

Use **Previous** to revisit earlier work. **Pause** preserves the exact checkpoint in
this browser. A deferred activity remains required.

## Quality diagnostics

XQG records privacy-minimized categories and counts locally. It can identify repeated
click patterns, failed recovery contracts, runtime errors, premature completion, and
abandoned or deferred learning paths. Diagnostics identify a control category such as
`academy:answer-deferred`; they never contain the learner’s answer.

Use **Warden Diagnostics** to see aggregate event and finding counts. Use **Reset local
data** to delete Daily Bread progress and XER/XQG diagnostics from the browser.

## Administrator validation

For each interactive surface, test the happy path, wrong or invalid input, blank input,
retry, deferral, back, pause/resume, completion gate, keyboard operation, mobile layout,
reduced motion, unavailable provider state, and reset. Links must have a destination;
buttons must have an action or a labelled unavailable state.

## Troubleshooting

- If retry does not clear the answer, pause, reopen the lesson, and report the course
  and activity title—never the private answer.
- If Continue does not move, the activity is the final remaining requirement. Correct
  it now or pause and resume later.
- If a link or button appears inactive, report its visible label and screen. XQG does
  not need the entered content.

## Privacy boundary

All interaction diagnostics remain in local browser storage. No background microphone,
continuous screen capture, session replay, raw form values, or cross-device identity is
used. Any future remote analytics require a separate consent, retention, deletion, and
security release.
