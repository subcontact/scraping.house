import {
  BrowserContextOptions,
  BrowserType,
  BrowserContext,
  chromium,
  firefox,
  webkit,
  Browser,
  LaunchOptions,
  Page,
} from 'playwright-core';

import fs from 'fs';
import selectors from './selectors';
import UserProfile from './userProfile';

export default class Linkedjs {
  private browser: Browser;

  private context: BrowserContext;

  private page: Page;

  private authenticatedContextPath: string;

  /**
     * Creates a new instance of Linkedjs by initialising browser, browsercontext and page
     * @param browser The type of the browser to use
     * @param contextOptions Context options that will be used in browsercontext
     * @param launchOptions Launch options that will be used while launching browsers
     * @param authenticatedContextPath The path to load or save the authenticated browser context
     * @returns A new onstance of Linkedjs by initialising browser, browser context
     * and creating a new page
     */
  public static async init(browser: 'chrome' | 'firefox' | 'webkit', launchOptions: LaunchOptions, contextOptions?: BrowserContextOptions, authenticatedContextPath: string = 'linkedjs.json'): Promise<Linkedjs> {
    let browserType: BrowserType;
    let bc: BrowserContext;
    switch (browser) {
      case 'chrome':
        browserType = chromium;
        break;
      case 'firefox':
        browserType = firefox;
        break;
      default:
        browserType = webkit;
    }
    const b: Browser = await browserType.launch(launchOptions);
    if (authenticatedContextPath !== undefined && authenticatedContextPath !== null
          && this.isFileExists(authenticatedContextPath)) {
      bc = await this.loadAuthenticatedContext(b, authenticatedContextPath);
    } else {
      bc = await b.newContext(contextOptions);
    }
    const page: Page = await bc.newPage();
    await page.goto('https://linkedin.com');
    return new Linkedjs(b, bc, page, authenticatedContextPath);
  }

  /**
     * Login to your LinkedIn account with username and password
     * @param username The linkedin username to log in
     * @param password The password used to log in
     * @param rememberMe The boolean indicating that login credentials will be remembered next time.
     */
  public async login(username: string, password: string, rememberMe: boolean = true) {
    if (Linkedjs.isFileExists(this.authenticatedContextPath)) {
      // If the authenticated context already exists, do nothing
      console.info('An authenticated context already exists and will be used');
      return;
    }
    await this.page.fill(selectors.login.username, username);
    await this.page.fill(selectors.login.password, password);
    await this.page.click(selectors.login.submit);
    if (rememberMe) {
      Linkedjs.saveAuthenticatedContext(this.context, this.authenticatedContextPath);
    }
  }

  /**
   * Goes to the user's profile page and returns the UserProfile instance
   * @param id The id of the user
   * @returns The UserProfile object
   */
  public async userProfile(id: string): Promise<UserProfile> {
    const u: UserProfile = new UserProfile(id, this.page);
    await u.goToUserProfile();
    return u;
  }

  /**
     * Function closes page, context and browser
     */
  public async close() {
    await this.page.close();
    await this.context.close();
    await this.browser.close();
  }

  private constructor(browser: Browser,
    context: BrowserContext,
    page: Page,
    authenticatedContextPath: string) {
    this.browser = browser;
    this.context = context;
    this.page = page;
    this.authenticatedContextPath = authenticatedContextPath;
  }

  /**
     * Saves the authenticated browser context
     * @param context The current browser context
     * @param filePath The filepath to save the authenticated browser context
     */
  private static async saveAuthenticatedContext(context: BrowserContext, filePath: string) {
    await context.storageState({ path: filePath });
  }

  /**
     * Loads a previously saved browser context in a new browser context
     * @param browser The browser to which we want to load authenticated context
     * @param filePath The file path of the authenticated context
     * @returns Returns the browser context created from the saved context
     */
  private static async loadAuthenticatedContext(
    browser: Browser,
    filePath: string,
  ): Promise<BrowserContext> {
    return browser.newContext({ storageState: filePath });
  }

  /**
     * Checks if a file exists or not
     * @param filePath The path of the file to check
     * @returns true if file path exists, false if not
     */
  private static isFileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
}
