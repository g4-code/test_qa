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
  test('updates chief complaint before submit', async ({ page }) => {
    // Fill complaint first, then name — name change recreates submit handler
    // with the initial complaint captured in the closure.
    await page.fill(SELECTORS.chiefComplaint, 'Initial tooth sensitivity');
    await page.fill(SELECTORS.patientName, 'Alex Rivera');

    await page.fill(SELECTORS.chiefComplaint, 'Updated: severe lower molar pain');

    await page.click(SELECTORS.createNoteBtn);

    await page.getByRole('tab', { name: 'Submitted Notes' }).click();

    const complaint = page.locator(SELECTORS.noteComplaint).first();
    await expect(complaint).toHaveText('Updated: severe lower molar pain');
  });

  test('negation should not auto-complete safety items', async ({ page }) => {
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

  test('auto-assist completes a routine item from a positive phrase', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    await page.fill(SELECTORS.scriptedPhrase, 'reviewed current medication list');
    await page.getByRole('button', { name: 'Apply phrase' }).click();

    const medsCheckbox = page.getByRole('checkbox', {
      name: /Current medications reviewed/i,
    });
    await expect(medsCheckbox).toBeChecked();
  });

  test('negation does not auto-complete a routine item', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    await page.fill(SELECTORS.scriptedPhrase, 'no current medication taken');
    await page.getByRole('button', { name: 'Apply phrase' }).click();

    const medsCheckbox = page.getByRole('checkbox', {
      name: /Current medications reviewed/i,
    });
    await expect(medsCheckbox).not.toBeChecked();
  });

  test('clinician can manually check a safety-critical item', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    const allergiesCheckbox = page.getByRole('checkbox', {
      name: /Allergies reviewed/i,
    });
    await allergiesCheckbox.check();
    await expect(allergiesCheckbox).toBeChecked();
  });

  test('a mixed phrase auto-completes the routine item but not the critical one', async ({ page }) => {
    await fillIntakeForm(page, {
      name: 'Sam Chen',
      complaint: 'Routine checkup',
    });

    await page.fill(
      SELECTORS.scriptedPhrase,
      'reviewed current medication list, consent obtained'
    );
    await page.getByRole('button', { name: 'Apply phrase' }).click();

    await expect(
      page.getByRole('checkbox', { name: /Current medications reviewed/i })
    ).toBeChecked();
    await expect(
      page.getByRole('checkbox', { name: /Treatment consent obtained/i })
    ).not.toBeChecked();
  });

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

  test('double-clicking create only saves one note', async ({ page }) => {
    await fillIntakeForm(page, { name: 'Jordan Lee', complaint: 'Bleeding gums' });

    await page.locator(SELECTORS.createNoteBtn).dblclick();

    await page.getByRole('tab', { name: 'Submitted Notes' }).click();
    await expect(page.locator(SELECTORS.noteItem)).toHaveCount(1);
  });

  test('pressing Ctrl+Enter twice only saves one note', async ({ page }) => {
    await fillIntakeForm(page, { name: 'Jordan Lee', complaint: 'Bleeding gums' });

    await page.locator(SELECTORS.chiefComplaint).focus();
    await page.keyboard.press('Control+Enter');
    await page.keyboard.press('Control+Enter');

    await page.getByRole('tab', { name: 'Submitted Notes' }).click();
    await expect(page.locator(SELECTORS.noteItem)).toHaveCount(1);
  });
});
