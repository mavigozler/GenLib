"use strict";

import { test, expect } from '@playwright/test';

test('Image shrinks and opens in a new window', async ({ page, context }) => {
  await page.goto('http://127.0.0.1:5500/Site%20Page%20Analysis.html'); // Change to the actual URL

  // Select the first image (modify selector as needed)
  const image = await page.locator('img.shrunk-image');
  await expect(image).toBeVisible();

  // Simulate clicking the image
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    image.click()
  ]);

  // Verify new window opened with the full-size image
  await expect(newPage).toHaveURL(/.*fullsize-image\.jpg$/);
});

