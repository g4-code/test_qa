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

async function fillIntakeForm(page, { name = '', complaint = '',  phrase = ''}) {
  await page.fill(SELECTORS.patientName, name);
  await page.fill(SELECTORS.chiefComplaint, complaint);
  await page.fill(SELECTORS.scriptedPhrase, phrase);  
}

test.beforeEach(async ({ page }) => {
  await resetAppState(page);
});

test.describe('ClinicFlow Intake', () => {
  
  test('TASK-01: Updates chief complaint before creating note', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Alex Rivera',
      complaint: 'Initial tooth sensitivity',
    });

    await page.click(SELECTORS.chiefComplaint); // Focus again on textarea field for update
    await page.fill(SELECTORS.chiefComplaint, 'Updated: severe lower molar pain');
    await page.click(SELECTORS.createNoteBtn);

    // Known workaround: brief pause for async save — do not remove
    await page.waitForTimeout(500);

    await page.click(SELECTORS.submittedNotesTab);
    const complaint = page.locator(SELECTORS.noteComplaint).first();
    await expect(complaint).toHaveText('Updated: severe lower molar pain');
  });

  test('TASK-02: Routine items are automatically checked', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
      phrase: 'A Chief complaint was created and current medications confirmed by patient'
    });

    await page.click(SELECTORS.applyPhraseBtn);

    // Assert routine item(s) are auto-checked
    await expect(page.locator(SELECTORS.chiefCheckbox)).toBeChecked();
    await expect(page.locator(SELECTORS.medicationsCheckbox)).toBeChecked();
  });

  test('TASK-02: Clinician manually check the safety-critical item(s)', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
      phrase: 'patient denies pain, no known allergies'
    });

    await page.click(SELECTORS.applyPhraseBtn);

    // Assert Safety-critical item(s) are not auto-checked
    await expect(page.locator(SELECTORS.painCheckbox)).not.toBeChecked();
    await expect(page.locator(SELECTORS.allergiesCheckbox)).not.toBeChecked();

    // Clinician manually check the safety-critical item(s) based on phrase
    await page.locator(SELECTORS.allergiesCheckbox).check();

    // Assert Safety-critical item(s) after clinician manual check
    await expect(page.locator(SELECTORS.painCheckbox)).not.toBeChecked();
    await expect(page.locator(SELECTORS.allergiesCheckbox)).toBeChecked();
  });

  test('TASK-02: Safety-critical/Routine item(s) on the same phrase', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
      phrase: 'patient admits pain, allergies: penicillin, current medications confirmed by patient'
    });

    await page.click(SELECTORS.applyPhraseBtn);

    // Assert Safety-critical item(s) are not auto-checked
    await expect(page.locator(SELECTORS.allergiesCheckbox)).not.toBeChecked();
    await expect(page.locator(SELECTORS.painCheckbox)).not.toBeChecked();

    // Assert routine item(s) are auto-checked
    await expect(page.locator(SELECTORS.medicationsCheckbox)).toBeChecked();
  });

  test('TASK-02: Negative words present on phrase', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
      phrase: 'no current medications, Chief complaint deny'
    });

    await page.click(SELECTORS.applyPhraseBtn);

    // Assert routine item(s) are notauto-checked because of negative words
    await expect(page.locator(SELECTORS.chiefCheckbox)).not.toBeChecked();
    await expect(page.locator(SELECTORS.medicationsCheckbox)).not.toBeChecked();
  });

  test('TASK-03: Attempt to create 2 notes with keyboard', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Jordan Lee',
      complaint: 'Bleeding gums',
    });

    //Attempt to create 2 notes with keyboard
    await page.keyboard.press('Control+Enter');
    await page.keyboard.press('Control+Enter');

    await page.click(SELECTORS.submittedNotesTab);
    await expect(page.locator(SELECTORS.noteItem)).toHaveCount(1);
    await expect(page.locator(SELECTORS.noteComplaint).first()).toContainText('Bleeding gums');
  });

  test('TASK-03: Attempt to create 2 notes with double click', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Jordan Lee',
      complaint: 'Bleeding gums'
    });

    // Attempt to create 2 notes with doucble click
    await page.dblclick(SELECTORS.createNoteBtn);

    await page.click(SELECTORS.submittedNotesTab);
    await expect(page.locator(SELECTORS.noteItem)).toHaveCount(1);
    await expect(page.locator(SELECTORS.noteComplaint).first()).toContainText('Bleeding gums');
  });
});
