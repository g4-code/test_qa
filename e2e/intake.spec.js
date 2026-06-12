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

    await page.getByRole('tab', { name: 'Submitted Notes' }).click();
    const complaint = page.locator(SELECTORS.noteComplaint).first();
    await expect(complaint).toHaveText('Updated: severe lower molar pain');
  });

  test('TASK-02: Clinician manually check the safety-critical item(s)', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
      phrase: 'patient denies pain, no known allergies'
    });

    await page.getByRole('button', { name: 'Apply phrase' }).click();

    const painCheckbox = page.getByRole('checkbox', { name: /Pain present/i });
    const allergiesCheckbox = page.getByRole('checkbox', { name: /Allergies reviewed/i, });

    // Assert Safety-critical item(s) are not auto-checked
    await expect(painCheckbox).not.toBeChecked();
    await expect(allergiesCheckbox).not.toBeChecked();

    // Clinician manually check the safety-critical item(s) based on phrase
    await allergiesCheckbox.check();

    await expect(painCheckbox).not.toBeChecked();
    await expect(allergiesCheckbox).toBeChecked();

    await page.click(SELECTORS.createNoteBtn);
    await page.getByRole('tab', { name: 'Submitted Notes' }).click();
    await expect(page.locator(SELECTORS.noteComplaint).first()).toContainText('Routine checkup');
  });

  test('TASK-03: Attempt to create 2 notes with keyboard', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Jordan Lee',
      complaint: 'Bleeding gums',
    });

    //Attempt to create 2 notes with keyboard
    await page.keyboard.press('Control+Enter');
    await page.keyboard.press('Control+Enter');

    await page.getByRole('tab', { name: 'Submitted Notes' }).click();
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

    // Assert 'Create clinical note' button is disabled
    //await expect(page.getByRole('button', { name: 'Create clinical note' })).toBeDisabled();

    await page.getByRole('tab', { name: 'Submitted Notes' }).click();
    await expect(page.locator(SELECTORS.noteItem)).toHaveCount(1);
    await expect(page.locator(SELECTORS.noteComplaint).first()).toContainText('Bleeding gums');
  });
});
