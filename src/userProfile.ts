import { Page } from 'playwright-core';

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
  }
}
