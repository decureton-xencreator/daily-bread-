# Xen Quality Guardian 1.0 — Design Canon

XQG should feel like a calm coach, not surveillance. Errors use direct language,
specific explanations, and visible recovery controls. Red indicates the unmet
requirement; cyan identifies the next safe action; green is reserved for verified pass.

Every error state must preserve context and expose correction, help, deferral or safe
exit. Controls remain at least 44 pixels high, keyboard reachable, plainly labelled,
responsive below 760 pixels, and compatible with reduced motion. Status changes use
live regions without stealing focus. Spanish instruction always carries immediate
English meaning.

Rejected treatments include hidden retry gestures, disabled progression with no
explanation, decorative controls, forced answer disclosure, continuous recording,
session replay by default, generic “something went wrong” messages, and awarding credit
for deferred work.

## Surface coverage

Every public scene is declared in the Guardian registry, including intentionally
read-only briefings. Interactive surfaces declare a minimum expected control count and
a named recovery or degraded-state path. Dynamic interface changes trigger a new
quality sweep. New controls inherit the same label, action, link-safety, media, privacy,
and recovery requirements without relying on their color, visual prominence, or author.
