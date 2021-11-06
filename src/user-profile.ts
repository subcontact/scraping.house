import { Page, errors, ElementHandle } from 'playwright-core';
import Experience from './models/experience';
import Role from './models/role';
import selectors from './selectors';
import splitDashes from './helpers/string-helpers';
import DateInterval from './models/date-interval';
import Education from './models/education';
import School from './models/school';
import Module from './models/module';

export default class UserProfile extends Module {
  private id: string;

  public constructor(id: string, page: Page) {
    super(page);
    this.id = id;
  }

  /**
   * Function navigates to the user's LinkedIn profile page.
   */
  public async init() {
    const u: string = encodeURI(`https://www.linkedin.com/in/${this.id}/`);
    if (this.page.url() === u) {
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
    await this.init();
    return this.page.textContent(selectors.user.profile.base.fullName) as Promise<string>;
  }

  /**
   * Returns the user's short description from the user's profile
   * @returns The user's short description
   */
  public async shortDescription(): Promise<string> {
    await this.init();

    return this.page.textContent(selectors.user.profile.base.shortDesc) as Promise<string>;
  }

  /**
   * Returns the user's location from the user's profile
   * @returns The user's location
   */
  public async location(): Promise<string> {
    await this.init();

    return this.page.textContent(selectors.user.profile.base.location) as Promise<string>;
  }

  /**
   * Get the user's about text from the user's profile
   * @returns The user about text from the user's profile
   */
  public async about(): Promise<string> {
    await this.init();

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
    await this.init();
    try {
      await this.page.waitForSelector(selectors.user.profile.base.premiumBadge);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Function checks if the user has the influencer badge on his/her profile
   * @returns true if the user has influencer badge, false if not
   */
  public async isInfluencer(): Promise<boolean> {
    await this.init();
    try {
      await this.page.waitForSelector(selectors.user.profile.base.influencerBadge);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get the list of experiences listed on the user profile
   * @returns User's work experiences array
   */
  public async experiences(): Promise<Experience[]> {
    await this.init();
    const experiences: Experience[] = [];
    await this.init();
    await this.helpers.scrollUntilElementAppears(selectors.user.profile.experience.group);
    await this.helpers.expandAll(selectors.user.profile.experience.moreButton);
    const experienceWE: ElementHandle<SVGElement | HTMLElement>[] = await this
      .page.$$(selectors.user.profile.experience.group);
    for (let i = 0; i < experienceWE.length; i += 1) {
      const group: string = `${selectors.user.profile.experience.group}[${i + 1}]`;
      const roleContainer: string = `${group}${selectors.user.profile.experience.roleContainer}`;
      const link: string = `${group}//a`;
      const expandRoles: string = `${group}${selectors.user.profile.experience.expandRoles}`;
      const companyInternalURL = await this.page.getAttribute(link, 'href');
      try {
        const roleElements: ElementHandle<SVGElement | HTMLElement>[] = await this.page
          .$$(roleContainer);
        await this.helpers.expandAll(expandRoles);
        experiences.push(await this.getExperiencesWithMultipleRoles(
          group,
          roleElements,
          companyInternalURL ?? '',
        ));
      } catch (e) {
        experiences.push(await this.getExperienceWithSingleRole(group, link, companyInternalURL ?? ''));
      }
    }
    return experiences;
  }

  /**
   * Returns the list of education elements on the user's profile
   * @returns An array containing all the educations elements of the user
   */
  public async education(): Promise<Education[]> {
    await this.init();
    try {
      await this.helpers.scrollUntilElementAppears(selectors.user.profile.education.section);
    } catch (e) {
      console.warn('The user has not education information on his/her profile');
      return [];
    }
    await this.helpers.expandAll(selectors.user.profile.education.seeMoreButton);
    const educationListItems: ElementHandle<HTMLElement>[] = (await this.page
      .$$(selectors.user.profile.education.listItem) ?? []) as ElementHandle<HTMLElement>[];
    return Promise.all(educationListItems.map(async (educationListItem) => {
      const school: School = {
        name: await this.helpers.safeTextContent(
          selectors.user.profile.education.schoolName,
          educationListItem,
        ),
        url: await (await educationListItem.$('//a'))?.getAttribute('href') ?? '',
      };
      let di: string | string[] = await this.helpers.safeTextContent(
        selectors.user.profile.education.date,
        educationListItem,
      );
      di = splitDashes(di);
      return <Education>{
        school,
        fieldOfStudy: await this.helpers.safeTextContent(
          selectors.user.profile.education.fieldName,
          educationListItem,
        ),
        degree: await this.helpers.safeTextContent(
          selectors.user.profile.education.degreeName,
          educationListItem,
        ),
        description: await this.helpers.safeTextContent(
          selectors.user.profile.education.description,
          educationListItem,
        ),
        activitiesAndSocieties: await this.helpers.safeTextContent(
          selectors.user.profile.education.activitiesAndSocieties,
          educationListItem,
        ),
        date: {
          start: parseInt(di[0] ?? '-1', 10),
          end: (di.length > 1 ? parseInt(di[1]!, 10) : parseInt(di[0] ?? '-1', 10)),
        },
      };
    }));
  }

  /**
   * Function returns work experience with multiple roles
   * @param group The selector for the experience group
   * @param roleElements Array of ElementHandle contains roleElements
   * @param roleContainer Selector for the role container
   * @param companyInternalURL URL of the company
   * @returns The Experience object with multiple roles
   */
  private async getExperiencesWithMultipleRoles(
    group: string,
    roleElements: ElementHandle<SVGElement | HTMLElement>[],
    companyInternalURL: string,
  ): Promise<Experience> {
    // FIXME: Contrat type is incorrect
    const experienceGroupTitle: string = `${group}${selectors.user.profile.experience.groupTitle}`;
    const experienceGroupSubTitle: string = `${group}${selectors.user.profile.experience.groupSubTitle}`;
    const companyName: string = await this.page.textContent(experienceGroupTitle) ?? '';
    const totalDuration: string = await this.page.textContent(experienceGroupSubTitle) ?? '';
    const roles: Role[] = [];
    for (let i = 0; i < roleElements.length; i += 1) {
      const roleName: string = (await (await roleElements[i]!
        .$(selectors.user.profile.experience.roleName))!.textContent()) ?? '';
      const roleInfos = await roleElements[i]!.$$(selectors.user.profile.experience.roleInfo);
      const contratType: string = await this.helpers
        .safeTextContent(selectors.user.profile.experience.contratType, roleElements[i]);
      let roleLocation: string = '';
      if (roleInfos.length > 2) roleLocation = await roleInfos[2]!.textContent() ?? '';
      const ti: string[] = splitDashes(await roleInfos[0]!.textContent() ?? '');
      roles.push(
        {
          name: roleName,
          location: roleLocation,
          description: (await this.helpers.filteredTextContent(
            selectors.user.profile.experience.roleDescription,
            selectors.user.profile.experience.roleDescriptionMore,
            roleElements[i],
          )).trim(),
          duration: (await roleInfos[1]!.textContent() ?? '').trim(),
          timeInterval: {
            start: (ti[0] ?? '').trim(),
            end: ((ti.length !== 2 ? ti[0] : ti[1]) ?? '').trim(),
          },
          contractType: contratType,
        },
      );
    }
    return {
      company: {
        linkedInURL: companyInternalURL ?? '',
        name: companyName,
      },
      roles,
      location: '',
      totalDuration,
    };
  }

  /**
   * Returns an experience object with single role
   * @param group XPath selector for experience group container
   * @param groupLink XPath selector for experience group link
   * @param companyURL Company's internal URL
   * @returns The experience object with single role
   */
  private async getExperienceWithSingleRole(
    group: string,
    groupLink: string,
    companyURL: string,
  ): Promise<Experience> {
    const experienceSummary: string = `${groupLink}${selectors.user.profile.experience.summary}`;
    let companyName: string | string[] = `${experienceSummary}${selectors.user.profile.experience.companyName}`;
    let roleName: string = `${experienceSummary}//h3`;
    let timeInterval: string | string[] | DateInterval = `${experienceSummary}${selectors.user.profile.experience.timeInterval}`;
    let location: string = `${experienceSummary}${selectors.user.profile.experience.location}`;
    let duration: string = `${experienceSummary}${selectors.user.profile.experience.duration}`;
    let description: string = `${group}${selectors.user.profile.experience.description}`;
    companyName = await this.page.textContent(companyName) ?? '';
    companyName = companyName.trim();
    companyName = companyName.split('\n').filter((e) => e.length !== 0).map((e) => e.trim());
    const contractType = companyName[1] ?? '';
    companyName = companyName[0]!;
    roleName = await this.page.textContent(roleName) ?? '';
    timeInterval = await this.page.textContent(timeInterval) ?? '';
    timeInterval = splitDashes(timeInterval);
    timeInterval = {
      start: timeInterval[0]!.trim(),
      end: ((timeInterval.length === 2 ? timeInterval[1] : timeInterval[0])!).trim(),
    };
    location = await this.helpers.safeTextContent(location);
    duration = await this.page.textContent(duration) ?? '';
    description = await this.helpers.safeTextContent(description);
    return {
      company: {
        name: companyName,
        linkedInURL: companyURL,
      },
      location,
      roles: [
        {
          description,
          duration,
          location,
          name: roleName,
          timeInterval,
          contractType,
        },
      ],
      totalDuration: duration,
    };
  }
}
