# XDBS Xen Academy Voice Assessment Runtime

Date: 2026-07-25  
Release: XPS 4.5.0 / XAVR 1.0.0

## Delivered contract

- Microphone access begins only after **Start Speaking** and the pre-capture disclosure.
- Browser MediaRecorder performs real capture; Stop ends capture and releases every track.
- Replay uses a temporary object URL. Delete, Cancel, Disable Voice and page exit revoke the URL and discard audio.
- Audio is never persisted or transmitted. Transcript, latest attempt, best attempt, score and continuation stay in local browser state.
- Browser SpeechRecognition supplies Spanish transcription when available. The provider-neutral adapter exposes capture, transcription, pronunciation and TTS boundaries for future providers without client secrets.
- Slow and natural Spanish model playback uses browser speech synthesis.
- Six required modes cover listen-and-repeat, guided speaking, recall without text, sentence construction, mini-dialogue and conversation lab. Spanish is always followed by English.

## Assessment and Warden

Passing score: 80/100. Weights: phrase completion 25%, word accuracy 30%, pronunciation similarity 20%, pacing 10%, fluency 10%, hesitation 5%.

Browser recognition confidence is stored separately and never presented as pronunciation quality. Without a provider that returns genuine pronunciation evidence, pronunciation similarity is explicitly labeled a recognition-derived proxy. No phoneme-level claim is made. Spanish lesson XP and completion remain blocked until all required spoken activities have passing best-attempt evidence.

## Degraded states

Denied permission includes browser-settings recovery and Retry. Missing microphone, MediaRecorder, SpeechRecognition or TTS is labeled unavailable/browser-supported as appropriate. Existing typed Academy work remains available. Provider credentials are not present in client source.

## Validation boundary

Deterministic tests cover weights, threshold, exact phrase, omission feedback, best/latest persistence, spoken gate and absence of audio blobs in saved evidence. Real permission dialogs and audio devices require production-browser verification after deployment; Warden remains fail-closed until that evidence exists.
