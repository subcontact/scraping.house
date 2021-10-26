import { Page, errors } from 'playwright-core';
import selectors from './selectors';

export default class UserProfile {
  private id: string;

  private page: Page;

  public constructor(id: string, page: Page) {
    this.id = id;
    this.page = page;
  }

  /**
   * Function navigates to the user's LinkedIn profile page.
   */
  public async goToUserProfile() {
    const u: string = encodeURI(`https://linkedin.com/in/${this.id}/`);
    if (this.page.url() === u) {
      console.info('Currenly on the user profile page');
      return;
    }
    await this.page.goto(u);
    console.log('Navigated to the user profile page');
  }

  /**
   * Returns the full name of the LinkedIn user
   * @returns The full name of the user
   */
  public async fullName(): Promise<string> {
    return this.page.textContent(selectors.user.profile.base.fullName) as Promise<string>;
  }

  /**
   * Returns the user's short description from the user's profile
   * @returns The user's short description
   */
  public async shortDescription(): Promise<string> {
    return this.page.textContent(selectors.user.profile.base.shortDesc) as Promise<string>;
  }

  /**
   * Returns the user's location from the user's profile
   * @returns The user's location
   */
  public async location(): Promise<string> {
    return this.page.textContent(selectors.user.profile.base.location) as Promise<string>;
  }

  /**
   * Get the user's about text from the user's profile
   * @returns The user about text from the user's profile
   */
  public async about(): Promise<string> {
    try {
      const ri: string = (await this.page.textContent(selectors.user.profile.base.info)) as string;
      const id: string = (
        await this.page.textContent(selectors.user.profile.base.infoTextToDelete)
      ) as string;
      return (
        ri.substring(0, ri.lastIndexOf(id))
      + ri.substring(ri.lastIndexOf(id) + id.length)
      ).trim();
    } catch (e) {
      if (e instanceof errors.TimeoutError) {
        return '';
      }
      throw e;
    }
  }

  /**
   * Function checks if the user has premium badge or nor
   * @returns True if the user has premium badge false if not
   */
  public async isPremium(): Promise<boolean> {
    try {
      await this.page.waitForSelector(selectors.user.profile.base.premiumBadge);
      return true;
    } catch (e) {
      return false;
    }
  }
}
