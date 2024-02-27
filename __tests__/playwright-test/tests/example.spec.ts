import { test, expect } from '@playwright/test';

test('start chatting is displayed', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  //expect the start chatting link to be visible
  await expect (page.getByRole('link', { name: 'Start Chatting' })).toBeVisible();
});

test('No password error message', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  //fill in dummy email
  await page.getByPlaceholder('you@example.com').fill('dummyemail@gmail.com');
  await page.getByRole('button', { name: 'Login' }).click();
  //wait for netwrok to be idle
  await page.waitForLoadState('networkidle');
  //validate that correct message is shown to the user
  await expect(page.getByText('Invalid login credentials')).toBeVisible();
  
});

//more tests can be added here