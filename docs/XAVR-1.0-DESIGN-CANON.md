# XAVR 1.0 - Voice Assessment Design Canon

## Experience promise

Voice assessment must feel calm, explicit, private, and coach-like. The learner always
knows whether the microphone is off, requesting permission, listening, processing,
complete, denied, unavailable, or disabled.

## Protected interaction rules

- Microphone capture begins only after **Start Speaking**.
- The disclosure appears before the permission request.
- Spanish always precedes its English translation.
- Slow and natural model playback remain distinct.
- Destructive/privacy controls remain visible: Delete, Cancel, and Disable Voice.
- Passing evidence unlocks Continue; interface presence never unlocks completion.
- Retries carry no penalty. Best and latest attempts are separate.
- Typed work remains usable when voice is unavailable.

## State language

| State | Required message and behavior |
| --- | --- |
| Ready | “READY - microphone is off”; Stop and Submit disabled |
| Permission | Permission requested only after learner action |
| Listening | “LISTENING - microphone on”; Stop enabled |
| Processing | Capture stopped; microphone tracks released |
| Completed | Replay and Submit enabled |
| Denied | Browser-settings recovery plus Retry |
| Unavailable | Honest browser/device limitation plus typed fallback |
| Disabled | Voice off; typed Academy remains available |

## Visual and responsive rules

The voice card inherits the approved dark Xen Academy surface, high-contrast status
language, generous touch targets, and clear primary/secondary action hierarchy. At narrow
widths, controls wrap without horizontal overflow. Focus remains visible. Status changes
use an ARIA live region. Reduced-motion users receive no essential motion-only cue.

## Approved voice identity

Reference playback and spoken guidance use the approved Xen voice identity when that
provider is available. Browser speech synthesis is labeled browser-supported fallback.
Every narrated instruction has visible text. Voice identity never overrides privacy,
permission, Stop, or caption requirements.

## Rejected treatments

- Silent, continuous, automatic, or preemptive microphone activation
- A decorative microphone control with no capture state
- “AI pronunciation” claims without provider evidence
- Hidden deletion or disable controls
- Completion based only on opening the interface
- Audio upload or retention by default
- Spanish learning content without immediate English translation
