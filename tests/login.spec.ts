import {test, expect, Page} from '@playwright/test';
import * as fs from 'fs';
import * as yaml from 'js-yaml';



let homepage : string = "https://www.linkedin.com/";

// Create an interface to have the data from the user credentials yaml be interpretable
interface LoginData {
    username: string;
    password: string;
}

// Parse the user credentials yaml file
const credentialContents = fs.readFileSync('playwright/.auth/userCredentials.yaml', 'utf8');
const credentialData = yaml.load(credentialContents) as LoginData[];
// Only take the first entry (for now)
const loginData = credentialData[0];

// If we have multiple login data, we can use a loop to test all of them
// Now we are only using the first one
// for (const loginData of credentialData) {
  test(`login with username ${loginData.username}`, async ({ page }) : Promise<void> => {
    await login(page, loginData.username, loginData.password);
    // This may sometimes fail with a checkpoint challenge if we have tested too much
    await expect(page).toHaveURL((/feed/));
  });
// }


test('login with no e-mail', async ({ page }) : Promise<void> => {
  await page.goto(homepage + 'login');

  await page.getByLabel('Email or Phone').fill('wrongUserName');
  await page.getByLabel('Password').fill('wrongPassword');
  await page.locator('button >> text="Sign in"').click();
  const pageContent = await page.textContent('body');
  expect(pageContent.includes('Please enter a valid username')).toBe(true);
});

test('login with no valid e-mail', async ({ page }) : Promise<void> => {
  await page.goto(homepage + 'login');

  await page.getByLabel('Email or Phone').fill('wrongUserName2@email.com');
  await page.getByLabel('Password').fill('wrongPassword');
  await page.locator('button >> text="Sign in"').click();
  const pageContent = await page.textContent('body');
  expect(pageContent.includes('Wrong email or password. Try again or')).toBe(true);
});

test('forgot password', async ({ page }) : Promise<void> => {
  await page.goto(homepage + 'login');
  await page.content(); // Wait for the page to load so it works on Chromium
  await page.locator('a.btn__tertiary--medium.forgot-password').click();

  await expect(page).toHaveURL(/request-password-reset/);
});

test('login with third-party service', async ({ page }) : Promise<void> => {
  await page.goto(homepage + 'login');
  // TODO: Doesn't work for Chromium / Edge?? Needs debugging by someone who knows more about Playwright
  let popup : Promise<Page> = page.waitForEvent('popup');
  await page.locator('div[aria-label="Sign in with Google"]').click();
  let thirdPartyLoginPage : Page = await popup;
  await expect(thirdPartyLoginPage).toHaveURL(/accounts\.google\.com/);
});

test('sign up / join now', async ({ page }) : Promise<void> => {
  await page.goto(homepage + '/login');
  await page.click('a[id="join_now"]');
  await expect(page).toHaveURL(/signup/);
});

async function login(page: Page, username: string, password: string) : Promise<void> {
  await page.goto(homepage + "login");
  await page.getByLabel('Email or Phone').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.locator('button >> text="Sign in"').click();
}