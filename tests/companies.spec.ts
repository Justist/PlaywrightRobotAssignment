import {test, expect, Page, BrowserContext} from '@playwright/test';
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
// Only take the first entry
const loginData = credentialData[0];

// Global variable used in beforeAll and subsequently all tests
let context: BrowserContext;

// Before all tests, login to LinkedIn
test.beforeAll("Setup", async ({ browser }) => {
    context = await browser.newContext();
    const page = await context.newPage();
    await login(page, loginData.username, loginData.password);
});

// Create an interface to have the data from the yaml be interpretable
interface CompanyData {
    companyName: string;
    followers: string;
}

// Parse the yaml file
const companyContents = fs.readFileSync('test-input/companies.yaml', 'utf8');
const companyData = yaml.load(companyContents) as CompanyData[];

for (const companyEntry of companyData) {
    test (`Check followers of company ${companyEntry.companyName}`, async ({ page }) : Promise<void> => {
        await context.newPage(); // To make sure we are logged in
        await goToCompanyPage(companyEntry.companyName)({page});
        // Check only the text at the top of the page, otherwise there are many more (wrong) matches
        let topElements = await page.$$(".org-top-card-summary-info-list__info-item");
        let followerRegex = new RegExp(`(\\b\\w+\\b)(?=\\s+followers)`);
        for (let element of topElements) {
            let text = await element.textContent();
            if (text.match(followerRegex)) {
                expect(text.match(followerRegex)[0]).toBe(companyEntry.followers);
                return;
            }
        }
    });
}

async function login(page: Page, username: string, password: string) : Promise<void> {
    await page.goto(homepage + "login");
    await page.getByLabel('Email or Phone').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.locator('button >> text="Sign in"').click();
}

function goToCompanyPage(company: string) {
    return async ({ page }) : Promise<void> => {
        await page.goto(homepage + 'company/' + company);
        await expect(page).toHaveURL(new RegExp(`company/${company}`));
    };
}