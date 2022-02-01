import { ElementHandle, Page } from 'playwright-core';

export default class BrowserHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Function clicks on the selector until it disappears
   * @param selector The selector to click on to expand
   */
  public async clickUntilElementDissapears(selector: string, element?: ElementHandle): Promise<void> {
    try {
      if (element === undefined) {
        await this.page.click(selector);
      } else {
        await this.page.waitForSelector(selector);
        const e = await element.$(selector);
        await e!.click();
      }
      this.clickUntilElementDissapears(selector, element);
    } catch (e) {
      (() => {})();
    }
  }

  /**
   * Function returns the scollable height of the current page
   * @returns The scrollable height of the current page
   */
  private async getScrollableHeight(): Promise<number> {
    return this.page.evaluate(() => document.body.scrollHeight);
  }

  /**
   * Function scrolls the given height
   * @param p The given height to scroll to
   */
  public async scroll(p: number) {
    this.page.evaluate((n) => window.scroll(0, n), p);
  }

  /**
   * Function scrolls to the top of the page
   */
  public async scrollToTop() {
    this.scroll(0);
  }

  /**
   * Function scrolls the page until the givne element appears on the page.
   * @param selector The selector of the element to check
   * @throws If the selector does not exists on the current page
   */
  public async scrollUntilElementAppears(selector: string) {
    let i: number = 0;
    try {
      await this.page.waitForSelector(selector);
    } catch (e) {
      await this.scrollToTop();
    }
    let max = await this.getScrollableHeight();
    while (i <= max) {
      try {
        await this.page.waitForSelector(selector);
        await this.page.$eval(selector, (elem) => elem.scrollIntoView());
        return;
      } catch (e) {
        i += (await this.getScrollableHeight()) / 10;
        max = await this.getScrollableHeight();
        this.scroll(i);
      }
    }
    throw new Error(`${selector} does not exists on the current page`);
  }

  /**
   *  Returns the text content of the selector if exists. An empty string if not
   * @param selector The selector of the element
   * @param element The element from which we will search the selector.
   * @returns Text content of the selected element if exists, or an empty string
   */
  public async safeTextContent(selector: string, element?: ElementHandle): Promise<string> {
    const textContent = async (s: string): Promise<string | null> => {
      if (element === undefined) {
        return this.page.textContent(s);
      }
      return (await element.$(s))!.textContent();
    };
    try {
      return (await textContent(selector)) ?? '';
    } catch (e) {
      return '';
    }
  }

  /**
   * Returns the text content of the element without text content of the ignored element
   * @param selector The XPath selector for the description
   * @param element The element on which the path selector will be searched
   * @returns The description of the experience
   */
  public async filteredTextContent(
    selector: string,
    ignoredElementSelector: string,
    element?: ElementHandle
  ): Promise<string> {
    let result = '';
    const textContent = async (s: string): Promise<string | null> => {
      if (element === undefined) {
        return this.page.textContent(s);
      }
      return (await element.$(s))!.textContent();
    };
    try {
      result = (await textContent(selector)) ?? '';
      try {
        const showMore: string = `${selector}${ignoredElementSelector}`;
        const textToIgnore: string = (await textContent(showMore)) ?? '';
        const ii: number = result.lastIndexOf(textToIgnore);
        result = `${result.substring(0, ii)}${result.substring(ii + textToIgnore.length)}`;
      } catch {
        (() => {})();
      }
    } catch {
      return '';
    }
    return result;
  }

  /**
   * Returns the attribute of the given element, if not exists an empty string
   * @param selector The selector of the element
   * @param attributeName The name of the attribute
   * @param element The element on which we will run the element search
   * @returns The content of the attribute of the given element
   */
  public async getAttributeSafe(
    selector: string,
    attributeName: string,
    element?: ElementHandle
  ): Promise<string> {
    try {
      if (element !== undefined) {
        await element.waitForSelector(selector);
        const e = await element.$(selector);
        return (await e!.getAttribute(attributeName)) ?? '';
      }
      return (await this.page.getAttribute(selector, attributeName)) ?? '';
    } catch {
      return '';
    }
  }

  /**
   * Checks if the selector is present in the current page or on the current element
   * @param selector The selector to check if present
   * @param element The parent element to evaluate the selector
   * @returns True if the selector is present on the current element or on the current page
   */
  public async isElementPresent(selector: string, element?: ElementHandle): Promise<boolean> {
    try {
      if (element === undefined) {
        await this.page.waitForSelector(selector);
        return true;
      }
      await element.waitForSelector(selector);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll the given element
   * @param element The element to scroll
   */
  public async scrollElement(element: ElementHandle<SVGElement | HTMLElement>): Promise<void> {
    return element.evaluate((node) => {
      node.scrollBy(0, node.scrollHeight);
      node.scrollHeight;
    });
  }

  /**
   * Checks if the given element is completely scrolled or not
   * @param element The element to verify
   * @returns True if the given element is completely scrolled, false if not
   */
  public async elementCompletelyScrolled(element: ElementHandle<SVGElement | HTMLElement>): Promise<boolean> {
    return element.evaluate((node) => {
      return node.scrollHeight - Math.abs(node.scrollTop) === node.clientHeight;
    });
  }
}
