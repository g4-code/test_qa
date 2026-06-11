import { test, expect } from '@playwright/test';
import { SELECTORS } from './helpers/testIds.js';

async function resetAppState(page) {
  await page.goto('/');
  await page.evaluate(() => {
    if (window.__clinicflowReset) {
      window.__clinicflowReset();
    }
  });
}

async function fillIntakeForm(page, { name, complaint }) {
  await page.fill(SELECTORS.patientName, name);
  await page.fill(SELECTORS.chiefComplaint, complaint);
}

test.beforeEach(async ({ page }) => {
  await resetAppState(page);
});

test.describe('ClinicFlow Intake', () => {
  // TASK-01: flaky test — uses arbitrary sleep instead of waiting for persisted state
  test('updates chief complaint before submit', async ({ page }) => {
    // Fill complaint first, then name — name change recreates submit handler
    // with the initial complaint captured in the closure.
    await page.fill(SELECTORS.chiefComplaint, 'Initial tooth sensitivity');
    await page.fill(SELECTORS.patientName, 'Alex Rivera');

    await page.fill(SELECTORS.chiefComplaint, 'Updated: severe lower molar pain');

    await page.click(SELECTORS.createNoteBtn);

    // App navigates to 'Submitted Notes' tab after a note is saved
    const complaint = page.locator(SELECTORS.noteComplaint).first();
    await expect(complaint).toHaveText('Updated: severe lower molar pain');
  });

  // TASK-02: skipped — candidate should enable and fix
  test.skip('negation should not auto-complete safety items', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    await page.fill(
      SELECTORS.scriptedPhrase,
      'patient denies pain, no known allergies'
    );
    await page.getByRole('button', { name: 'Apply phrase' }).click();

    const painCheckbox = page.getByRole('checkbox', { name: /Pain present/i });
    const allergiesCheckbox = page.getByRole('checkbox', {
      name: /Allergies reviewed/i,
    });

    await expect(painCheckbox).not.toBeChecked();
    await expect(allergiesCheckbox).not.toBeChecked();
  });

  // TASK-02 trap test: encodes the WRONG expected behavior
  test('scripted phrase auto-checks matching checklist keywords', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    await page.fill(
      SELECTORS.scriptedPhrase,
      'patient denies pain, no known allergies'
    );
    await page.getByRole('button', { name: 'Apply phrase' }).click();

    const painCheckbox = page.getByRole('checkbox', { name: /Pain present/i });
    const allergiesCheckbox = page.getByRole('checkbox', {
      name: /Allergies reviewed/i,
    });

    // BUG: this asserts the defective behavior as correct
    await expect(painCheckbox).toBeChecked();
    await expect(allergiesCheckbox).toBeChecked();
  });

  // TASK-03: incomplete — single submit only, no duplicate guard assertion
  test('creates a clinical note from intake form', async ({ page }) => {
    await page.fill(SELECTORS.chiefComplaint, 'Bleeding gums');
    await page.fill(SELECTORS.patientName, 'Jordan Lee');

    await page.click(SELECTORS.createNoteBtn);
    await page.getByRole('tab', { name: 'Submitted Notes' }).click();

    await expect(page.locator(SELECTORS.noteItem)).toHaveCount(1);
    await expect(page.locator(SELECTORS.noteComplaint).first()).toContainText(
      'Bleeding gums'
    );
  });
});
