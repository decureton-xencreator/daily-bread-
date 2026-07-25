# Xen Alpha One Activation Center 1.0

The Activation Center turns the existing XAOA-001 controller into a guided operator experience. It does not activate systems by appearance or by button press. It reads the ordered evidence contract and shows the first gate that has not passed.

## Use it

1. Open **Alpha One Activation** from the Command Deck index.
2. Read **Current Gate**. This is the only gate eligible to advance.
3. Choose **Show recovery guide** to see the safe continuation.
4. Gather authentic, non-secret evidence outside the public interface.
5. Run the gate's declared validation.
6. Choose **Retry evaluation** after the governed evidence source is updated.
7. Use **Copy continuation** for a content-free handoff, or **Defer safely** to pause without losing the route.

## Truth states

- **Passed** means the current evaluation contains valid evidence.
- **Evidence required** identifies the first unmet gate.
- **Waiting for predecessor** means the gate cannot yet be evaluated.
- **Gold Master complete** is permitted only when all 11 ordered gates pass and XBP-009 authorizes the decision.

Configuration is not activation. A successful deployment is not pilot success. A pilot result is not Gold Master approval.

## Recovery

Every blocked state explains the gate and preserves a route to retry, defer, and resume. Deferral never grants credit. A failed copy action leaves the guidance visible. The center never stores credentials, approval payloads, private content, or invented evidence.

## Accessibility and privacy

The scene is keyboard reachable, uses real buttons, exposes the current gate through live status, supports reduced motion, and collapses to one column on mobile. Interaction diagnostics store only local categorical events.

## Maintenance and rollback

Run `node --test tests/activation-center.test.mjs`, the Alpha One tests, Guardian tests, and `python scripts/validate_site.py`. Roll back the Activation Center files without altering the underlying XAOA-001 controller or evidence records.
