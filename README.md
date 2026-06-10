# ClinicFlow Intake — QA Technical Assessment

ClinicFlow Intake is a lightweight dental patient intake application. Clinicians capture a patient's name, chief complaint, and a safety checklist before creating a clinical note in a downstream system.

This repository is a **technical assessment** for a Senior QA role. Your goal is to investigate the application, improve the Playwright test suite, and fix the defects you find.

## Prerequisites

- **Node.js** 18 or later
- **npm** (comes with Node)

## Local setup

```bash
# Clone the repository and install dependencies
npm install

# Install Playwright browser (first time only)
npx playwright install chromium

# Start the development server
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173).

## Running Playwright tests

With the dev server stopped, Playwright will start it automatically:

```bash
npm run test:e2e
```

Interactive UI mode:

```bash
npm run test:e2e:ui
```

## What to do

1. Read **[TASKS.md](./TASKS.md)** for the assessment brief, business rules, and deliverables.
2. Explore the app manually and run the existing Playwright suite.
3. Fix application defects and improve tests so the suite is reliable and meaningful.
4. Open a pull request with:
   - A summary per task (what you found, root cause, how you verified)
   - Your reasoning — especially if you rejected an obvious-looking fix

## Project structure

```
src/           React application source
e2e/           Playwright end-to-end tests
TASKS.md       Assessment tasks and acceptance criteria
```

## Notes

- Speech input is simulated via the **Scripted clinical phrase** field — no microphone is required.
- The mock EHR stores notes in memory; refreshing the page clears submitted notes.
- Focus on **durable fixes** and **tests that catch real regressions**, not flaky workarounds.

Good luck!
