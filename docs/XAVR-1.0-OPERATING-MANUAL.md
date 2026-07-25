# Xen Academy Voice Runtime - Operating Manual

**Product:** XAVR 1.0.0 / XPS 4.5.0
**Audience:** Xen Academy learners, support operators, and release reviewers
**Canonical runtime:** Xen Daily Bread Academy
**Privacy default:** Audio stays in the active browser session and is never uploaded

## What it does

XAVR lets a learner listen to a Spanish model phrase, record a spoken attempt, replay it,
submit it for browser-supported assessment, retry without penalty, and preserve passing
evidence for Resume Anywhere on the same browser profile. Every Spanish phrase is followed
by its English translation.

## Complete a spoken activity

1. Open **Academy** and enter the Spanish voice activity.
2. Read **Before you start**. The microphone is off at this point.
3. Use **Play slow model** or **Play natural model**.
4. Press **Start Speaking**. Only this explicit action may trigger the browser permission
   request.
5. Choose **Allow** if you want to use voice. Speak the displayed phrase, then press
   **Stop Recording**.
6. Use **Replay** to hear the temporary recording.
7. Press **Submit for Assessment**. If the attempt passes, **Continue** becomes available.
   If it does not pass, read the focused correction and use **Retry**.
8. Complete all six required speaking modes. Warden blocks spoken completion until each
   activity has a passing best attempt.

## Controls

| Control | Result |
| --- | --- |
| Start Speaking | Requests permission and starts capture only after approval |
| Stop Recording | Stops capture and releases the microphone |
| Replay | Plays the current temporary recording |
| Retry | Deletes the current attempt and returns to Ready |
| Submit for Assessment | Scores the available transcript and saves evidence locally |
| Delete Recording | Revokes playback and discards captured audio |
| Cancel | Discards the attempt and releases the microphone |
| Disable Voice | Discards audio, releases the microphone, and keeps typed lessons usable |

## Scores

The passing threshold is 80/100. Phrase completion is 25%, word accuracy 30%,
pronunciation similarity 20%, pacing 10%, fluency 10%, and hesitation 5%.
Speech-recognition confidence is shown separately. Browser-only pronunciation similarity
is a recognition-derived proxy; XAVR does not claim phoneme-level analysis.

## Permission recovery

- **Denied:** Open the browser's site controls, allow Microphone for the Daily Bread site,
  return to Academy, and press **Retry**.
- **Unavailable:** Use current Chrome or Edge on a microphone-equipped device. Typed
  Academy assessment remains available.
- **No transcript:** Retry in a browser that supports Spanish Speech Recognition. The
  audio is not uploaded to compensate for missing browser support.
- **Microphone appears active:** Press **Stop Recording**, **Cancel**, or **Disable
  Voice**. Leaving the page also releases active tracks.

## Privacy, deletion, and reset

The recording exists only as an in-memory browser object URL. It is not placed in local
storage or source control and is not transmitted. **Delete Recording**, **Retry**,
**Cancel**, **Disable Voice**, or leaving the page discards it. Transcript, score, latest
attempt, and best attempt stay in local browser storage for same-browser Resume Anywhere.
Use Daily Bread's **Reset local data** control to remove saved learner evidence and local
telemetry.

## Support and release review

Before calling a release Warden complete, verify the allow path, deny/recovery path,
recording stop, replay, deletion, assessment, retry, passing gate, saved evidence, typed
fallback, mobile layout, keyboard/screen-reader treatment, privacy, exact production
release marker, and absence of exposed secrets. A user report may support device evidence
but must be labeled as user-reported unless independently observed.
