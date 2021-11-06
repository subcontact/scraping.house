import { Page } from 'playwright-core';
import BrowserHelpers from '../helpers/browser-helpers';

export default abstract class Module {
  protected id: string;

  protected page: Page;

  protected helpers: BrowserHelpers;

  protected constructor(id: string, page: Page) {
    this.id = id;
    this.page = page;
    this.helpers = new BrowserHelpers(this.page);
  }

  public async close() {
    await this.page.close();
  }

  public abstract init(): void;
}
