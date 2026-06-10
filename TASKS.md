# ClinicFlow Intake — Assessment Tasks

**Suggested timebox:** 2–3 hours  
**Deliverable:** A pull request that fixes the issues below and documents your reasoning.

---

## Product context

ClinicFlow Intake prepares a dental consultation record. Before the clinician sees the patient, staff capture:

- **Patient name**
- **Chief complaint** — the patient's primary reason for the visit
- **Safety checklist** — items that must be confirmed before treatment (some are **safety-critical**)

A **scripted clinical phrase** field simulates voice dictation: typing a phrase and clicking **Apply phrase** auto-evaluates checklist items based on keywords in the text.

When ready, the user clicks **Create clinical note** to persist the intake to the mock EHR. Submitted notes appear under the **Submitted Notes** tab.

### Glossary

| Term | Meaning |
|------|---------|
| Chief complaint | Primary reason for the visit, in the patient's words |
| Safety-critical item | Checklist item where an error could affect patient safety (marked **critical** in the UI) |
| Scripted phrase | Deterministic text input standing in for live speech recognition |

---

## General expectations

- Fix **both** the application and the Playwright tests where needed.
- Do **not** rely on arbitrary `waitForTimeout` sleeps to stabilize tests.
- Explain **root cause** in your PR — not just what you changed.
- If an existing test encodes incorrect behavior, fix the test and explain why.
- Safety-critical checklist rules are **clinical policy**, not mere UI preferences.

---

## TASK-01 — Chief complaint not saved correctly

### Symptom

A user enters a chief complaint, edits it to the final wording, and submits. The note stored in **Submitted Notes** sometimes shows the **earlier** text instead of the latest edit.

The Playwright test `updates chief complaint before submit` in `e2e/intake.spec.js` fails **intermittently**.

### Business rule (R-1)

Submitted clinical data must reflect the **current** form state at the moment of submission.

### Deliverables

- [ ] Reliable Playwright test that fails before your fix and passes after (no sleep-based flakiness)
- [ ] Application fix that ensures the saved complaint matches the latest textarea value
- [ ] PR notes explaining root cause and why superficial fixes (e.g. longer timeouts) are insufficient

### Acceptance criteria

- Editing the complaint immediately before submit always persists the final text
- The Playwright test passes consistently across multiple consecutive runs (`npm run test:e2e` at least 3 times)

---

## TASK-02 — Safety checklist false positives

### Symptom

Applying the scripted phrase `patient denies pain, no known allergies` auto-checks **Pain present** and **Allergies reviewed** — even though the patient is denying those conditions.

The test `negation should not auto-complete safety items` is currently **skipped**. Another test appears to expect the opposite behavior.

### Business rule (R-2)

- **Safety-critical** checklist items must **never** be auto-completed from fuzzy keyword matching alone; a clinician must confirm them manually.
- Negation in clinical text (`denies`, `no known`, etc.) must not silently invert meaning.
- Auto-assist for routine items may exist, but must not create false positives on negated statements.

### Deliverables

- [ ] Application logic that respects R-2
- [ ] Un-skipped, corrected Playwright coverage for negation and safety-critical policy
- [ ] At least one test verifying a clinician can still **manually** check a safety-critical item
- [ ] PR notes on any test you changed that previously asserted wrong behavior

### Acceptance criteria

- `patient denies pain, no known allergies` does **not** auto-check pain or allergies items
- Safety-critical items require explicit human confirmation to be marked complete
- All checklist-related tests pass and encode correct clinical policy

---

## TASK-03 — Duplicate clinical notes

### Symptom

Rapid double submission — double-clicking **Create clinical note** or pressing **Ctrl/Cmd + Enter** twice quickly — creates **duplicate** entries in **Submitted Notes**.

The existing Playwright suite does not adequately guard against this.

### Business rule (R-3)

Note creation must be **idempotent** for a given intake draft: repeated submit actions must not create multiple records. Incomplete drafts must not be submitted.

### Deliverables

- [ ] Application-level idempotency (not only disabling a button in the UI)
- [ ] New or updated Playwright test that reproduces double-submit and asserts exactly **one** note is created
- [ ] PR notes explaining why UI-only guards (e.g. `disabled` button) are insufficient

### Acceptance criteria

- Double-click and rapid keyboard submit each produce at most one note
- Playwright test fails on the unfixed app and passes on your fix
- Idempotency survives even if the submit handler is invoked through different code paths

---

## Submission checklist

- [ ] `npm run dev` starts without errors
- [ ] `npm run test:e2e` — all tests pass
- [ ] PR description addresses TASK-01, TASK-02, and TASK-03 separately
- [ ] No committed `waitForTimeout` used purely to mask timing issues
