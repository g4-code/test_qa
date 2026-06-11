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

  // TASK-01: Regression test for bug of chief complaint not saving correctly
  // Do not alter sequence of actions, as this exact sequence is the one that triggered the bug
  test('updates chief complaint before submit', async ({ page }) => {

    await page.fill(SELECTORS.chiefComplaint, 'Initial tooth sensitivity');
    await page.fill(SELECTORS.patientName, 'Alex Rivera');

    await page.fill(SELECTORS.chiefComplaint, 'Updated: severe lower molar pain');

    await page.click(SELECTORS.createNoteBtn);

    // App navigates to 'Submitted Notes' tab after a note is saved
    const complaint = page.locator(SELECTORS.noteComplaint).first();
    await expect(complaint).toHaveText('Updated: severe lower molar pain');
  });

  // TASK-02: Regression test for bug of auto-completion of safety-critical items
  test('safety-critical items should not be auto-completed', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    await page.fill(
      SELECTORS.scriptedPhrase,
      'patient feels pain in molar, is allergic to penicillin, has consented to treatment'
    );
    await page.getByRole('button', { name: 'Apply phrase' }).click();

    const painCheckbox = page.getByRole('checkbox', { name: /Pain present/i });
    const allergiesCheckbox = page.getByRole('checkbox', {
      name: /Allergies reviewed/i,
    });
    const consentTreatmentCheckbox = page.getByRole('checkbox', {
      name: /Treatment consent obtained/i,
    });

    await expect(painCheckbox).not.toBeChecked();
    await expect(allergiesCheckbox).not.toBeChecked();
    await expect(consentTreatmentCheckbox).not.toBeChecked();
  });

  // TASK-02: Happy path for completing safety-critical items
  test('safety-critical items can be completed manually', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    await page.fill(
        SELECTORS.scriptedPhrase,
        'patient feels pain in molar, is allergic to penicillin'
    );

    const painCheckbox = page.getByRole('checkbox', { name: /Pain present/i });
    const allergiesCheckbox = page.getByRole('checkbox', {
      name: /Allergies reviewed/i,
    });

    await painCheckbox.click();
    await allergiesCheckbox.click();

    await expect(painCheckbox).toBeChecked();
    await expect(allergiesCheckbox).toBeChecked();
  });

  // TASK-02: Regression test for bug of false positives on negated statements
  test('negation should not auto-complete routine items', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    await page.fill(
      SELECTORS.scriptedPhrase,
      'no record of chief complaint, current medications have not been reviewed'
    );

    await page.getByRole('button', { name: 'Apply phrase' }).click();

    const currentMedicationCheckbox = page.getByRole('checkbox', { name: /Current medications reviewed/i });
    const complaintCheckbox = page.getByRole('checkbox', {
      name: /Chief complaint recorded/i,
    });

    await expect(currentMedicationCheckbox).not.toBeChecked();
    await expect(complaintCheckbox).not.toBeChecked();
  });

  // TASK-02: Happy path for auto-completing routine items
  test('routine items are auto-completed', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    await page.fill(
      SELECTORS.scriptedPhrase,
      'patient current medication: ibuprofen. Chief complaint recorded'
    );

    await page.getByRole('button', { name: 'Apply phrase' }).click();

    const currentMedicationCheckbox = page.getByRole('checkbox', { name: /Current medications reviewed/i });
    const complaintCheckbox = page.getByRole('checkbox', {
      name: /Chief complaint recorded/i,
    });

    await expect(currentMedicationCheckbox).toBeChecked();
    await expect(complaintCheckbox).toBeChecked();
  });

  // TASK-02: Happy path for completing routine items manually
  test('routine items can be completed manually', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    await page.fill(
      SELECTORS.scriptedPhrase,
      'patient current medication: ibuprofen. Chief complaint recorded'
    );

    const currentMedicationCheckbox = page.getByRole('checkbox', { name: /Current medications reviewed/i });
    const complaintCheckbox = page.getByRole('checkbox', {
      name: /Chief complaint recorded/i,
    });

    await currentMedicationCheckbox.click();
    await complaintCheckbox.click();

    await expect(currentMedicationCheckbox).toBeChecked();
    await expect(complaintCheckbox).toBeChecked();
  });

  // TASK-02: Edge case for behavior of auto-completion with phrase containing routine and safety-critical items
  test('only routine items are auto-completed from scripted phrase containing both routine and safety-critical items', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    await page.fill(
        SELECTORS.scriptedPhrase,
        'Chief complaint has been recorded. Allergies: penicillin'
    );

    const complaintCheckbox = page.getByRole('checkbox', {
      name: /Chief complaint recorded/i,
    });
    const allergiesCheckbox = page.getByRole('checkbox', {
      name: /Allergies reviewed/i,
    });

    await page.getByRole('button', { name: 'Apply phrase' }).click();

    await expect(complaintCheckbox).toBeChecked();
    await expect(allergiesCheckbox).not.toBeChecked();
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
