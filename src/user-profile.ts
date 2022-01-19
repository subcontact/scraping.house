import { Page, errors, ElementHandle } from 'playwright-core';
import Experience from './models/experience';
import Role from './models/role';
import selectors from './selectors';
import splitDashes from './helpers/string-helpers';
import DateInterval from './models/date-interval';
import Education from './models/education';
import School from './models/school';
import Module from './models/module';
import Certification from './models/certification';

type StringOrNotDefined = string | null | undefined;
type ElementHandlePromiseOrStringPromiseOrString =
Promise<ElementHandle<SVGElement | HTMLElement> | string | null | undefined> |
StringOrNotDefined | ElementHandle<SVGElement | HTMLElement>;

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
    try {
      await this.helpers.scrollUntilElementAppears(selectors.user.profile.experience.group);
    } catch (e) {
      return [];
    }
    await this.helpers.clickUntilElementDissapears(selectors.user.profile.experience.moreButton);
    const experienceWE: ElementHandle<SVGElement | HTMLElement>[] = await this
      .page.$$(selectors.user.profile.experience.group);
    return Promise.all(experienceWE.map(async (experienceItem) => {
      const companyURLLink: Promise<string> = this.helpers.getAttributeSafe('//a', 'href', experienceItem);
      const roleElements: Promise<ElementHandle<SVGElement | HTMLElement>[]> = experienceItem
        .$$(selectors.user.profile.experience.roleContainer);
      await this.helpers.clickUntilElementDissapears(
        selectors.user.profile.experience.expandRoles,
        experienceItem,
      );
      return Promise.all([roleElements, companyURLLink]).then(([re, curl]) => {
        console.log(`Number of role elements ${re.length}`);
        if (re.length) {
          // If there's at least one role
          return this.getExperiencesWithMultipleRoles(
            experienceItem,
            re,
            curl,
          );
        }
        return this.getExperienceWithSingleRole(
          experienceItem,
          companyURLLink,
        );
      });
    }));
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
    const educationSection = await this.page.$(
      selectors.user.profile.education.section,
    ) as ElementHandle;
    await this.helpers.clickUntilElementDissapears(
      selectors.user.profile.education.seeMoreButton,
      educationSection,
    );
    // Use then instead
    return this.page
      .$$(selectors.user.profile.education.listItem)
      .then((educationListItems) => Promise.all(educationListItems
        .map((educationListItem) => Promise.all([
          this.helpers.safeTextContent(
            selectors.user.profile.education.schoolName,
            educationListItem,
          ),
          this.helpers.getAttributeSafe('//a', 'href', educationListItem),
          this.helpers.safeTextContent(
            selectors.user.profile.education.date,
            educationListItem,
          ),
          this.helpers.safeTextContent(
            selectors.user.profile.education.fieldName,
            educationListItem,
          ),
          this.helpers.safeTextContent(
            selectors.user.profile.education.degreeName,
            educationListItem,
          ),
          this.helpers.safeTextContent(
            selectors.user.profile.education.description,
            educationListItem,
          ),
          this.helpers.safeTextContent(
            selectors.user.profile.education.activitiesAndSocieties,
            educationListItem,
          ),
        ]).then(([
          schoolName,
          schoolURL,
          dateInterval,
          fieldOfStudy,
          degree,
          description,
          activitiesAndSocieties,
        ]) => {
          const school: School = {
            name: schoolName,
            url: schoolURL,
          };
          const di: string[] = splitDashes(dateInterval);
          return <Education>{
            school,
            fieldOfStudy,
            degree,
            description,
            activitiesAndSocieties,
            date: {
              start: parseInt(di[0] ?? '-1', 10),
              end: (di.length > 1 ? parseInt(di[1]!, 10) : parseInt(di[0] ?? '-1', 10)),
            },
          };
        }))));
  }

  // TODO: Complete JSDoc
  public async certifications(): Promise<Certification[]> {
    await this.init();
    try {
      await this.helpers.scrollUntilElementAppears(selectors.user.profile.certifications.section);
    } catch (e) {
      console.warn('User has no experience section on his/her profile');
      return [];
    }
    const section: ElementHandle = await this.page.$(
      selectors.user.profile.certifications.section,
    ) as ElementHandle;
    await this.helpers.clickUntilElementDissapears(
      selectors.user.profile.certifications.seeMore,
      section,
    );
    await this.page.waitForTimeout(5000);
    return section.$$(selectors.user.profile.certifications.item)
      .then((certificationItems) => Promise.all(certificationItems
        .map((certificationItem) => Promise.all([
          this.helpers.getAttributeSafe(
            selectors.user.profile.certifications.companyURL,
            'href',
            certificationItem,
          ),
          this.helpers.safeTextContent(
            selectors.user.profile.certifications.companyName,
            certificationItem,
          ),
          this.helpers.safeTextContent(
            selectors.user.profile.certifications.name,
            certificationItem,
          ),
          this.helpers.safeTextContent(
            selectors.user.profile.certifications.dates,
            certificationItem,
          ),
          this.helpers.safeTextContent(
            selectors.user.profile.certifications.credential.id,
            certificationItem,
          ),
          this.helpers.getAttributeSafe(
            selectors.user.profile.certifications.credential.url,
            'href',
            certificationItem,
          ),
        // TODO: Complete with others
        ]).then(([
          companyUrl,
          companyName,
          certificateName,
          dates,
          credentialId,
          credentialURL,
        ]) => {
          /*
            TODO: Find a way to handle texts for other languages
            (ideally it should be language free matching)
           */
          const matchResult: RegExpMatchArray | null = dates.match(/issued\s*([^\d]*\s+[0-9]+)\s*(no)? expiration date\s*([^\d]*\s+[0-9]+)?/i);
          const parsedDate: { issued: string, expiration: string } = { issued: '', expiration: '' };
          if (
            matchResult !== undefined
            && matchResult !== null
          ) {
            console.log(`dates ${dates}. Math result length ${matchResult.length}`);
            parsedDate.issued = matchResult[1]!;
            console.log(`First match ${matchResult[1]}`);
            // If the second match is not undefined then the third match will be undefined
            parsedDate.expiration = (matchResult[2] ? matchResult[3] ?? 'N/A' : 'N/A');
            console.log(`Second match match ${matchResult[2]}`);
            console.log(`Third match match ${matchResult[3]}`);
          }
          return <Certification>{
            name: certificateName.trim(),
            issuer: {
              name: companyName.trim(),
              linkedInURL: companyUrl.trim(),
            },
            // FIXME: Credentials not working check WHY?
            credential: {
              id: credentialId.replace(/\s*credential\s+id\s*/i, '').trim(),
              url: credentialURL.trim(),
            },
            // FIXME: We can not parse dates with dashes check WHY?
            issued: parsedDate.issued,
            expiration: parsedDate.expiration,
          };
        }))));
  }

  /**
   * Function returns work experience with multiple roles
   * @param experienceItem The element handle related to the work experience
   * @param roleElements Array of ElementHandle contains roleElements
   * @param roleContainer Selector for the role container
   * @param companyInternalURL URL of the company
   * @returns The Experience object with multiple roles
   */
  private getExperiencesWithMultipleRoles(
    experienceItem: ElementHandle,
    roleElements: ElementHandle<SVGElement | HTMLElement>[],
    companyInternalURL: string,
  ): Promise<Experience> {
    return Promise.all<Experience | Role | string | undefined>([
      this.helpers.safeTextContent(selectors.user.profile.experience.groupTitle, experienceItem),
      this.helpers.safeTextContent(selectors.user.profile.experience.groupSubTitle, experienceItem),
      ...roleElements.map(async (roleElement) => {
        const roleName: ElementHandlePromiseOrStringPromiseOrString = roleElement.$(
          selectors.user.profile.experience.roleName,
        ).then((e) => e?.textContent());
        let roleInfo:
        Promise<ElementHandle<SVGElement | HTMLElement>[]> |
        ElementHandle<SVGElement | HTMLElement>[] = roleElement.$$(
          selectors.user.profile.experience.roleInfo,
        );
        const contractType: ElementHandlePromiseOrStringPromiseOrString = this.helpers
          .safeTextContent(
            selectors.user.profile.experience.contratType,
            roleElement,
          );
        roleInfo = await roleInfo;
        const roleLocation: ElementHandlePromiseOrStringPromiseOrString = (
          (roleInfo.length > 2) ? roleInfo[2]!.textContent() : ''
        );
        const ti: string[] = splitDashes(await roleInfo[0]!.textContent() ?? '');
        return Promise.all(
          [
            roleName,
            contractType,
            roleLocation,
            roleInfo[1]!.textContent(),
            this.helpers.filteredTextContent(
              selectors.user.profile.experience.roleDescription,
              selectors.user.profile.experience.roleDescriptionMore,
              roleElement,
            ),
          ],
        ).then((
          [rn,
            ct,
            rl,
            duration,
            description],
        ) => (<Role>{
          name: (rn as StringOrNotDefined) ?? '',
          location: (rl as StringOrNotDefined) ?? '',
          description: description ?? '',
          duration: (duration ?? '').trim(),
          timeInterval: {
            start: (ti[0] ?? '').trim(),
            end: ((ti.length !== 2 ? ti[0] : ti[1]) ?? '').trim(),
          },
          contractType: (ct as StringOrNotDefined) ?? '',
        }));
      })]).then(([companyName, totalDuration, ...roles]) => (<Experience>{
      company: {
        linkedInURL: companyInternalURL ?? '',
        name: companyName,
      },
      roles,
      location: '',
      totalDuration,
    }));
  }

  /**
   * Returns an experience object with single role
   * @param experienceItem The element handle related to the experience
   * @param companyURL Company's internal URL
   * @returns The experience object with single role
   */
  private getExperienceWithSingleRole(
    experienceItem: ElementHandle,
    companyURL: Promise<string>,
  ): Promise<Experience> {
    const companyName: string = `${selectors.user.profile.experience.summary}${selectors.user.profile.experience.companyName}`;
    const roleName: string = `${selectors.user.profile.experience.summary}//h3`;
    const timeInterval: string = `${selectors.user.profile.experience.summary}${selectors.user.profile.experience.timeInterval}`;
    const location: string = `${selectors.user.profile.experience.summary}${selectors.user.profile.experience.location}`;
    const duration: string = `${selectors.user.profile.experience.summary}${selectors.user.profile.experience.duration}`;
    const description: string = `${selectors.user.profile.experience.description}`;
    return Promise.all([
      this.helpers.safeTextContent(companyName, experienceItem),
      this.helpers.safeTextContent(timeInterval, experienceItem),
      this.helpers.safeTextContent(location, experienceItem),
      this.helpers.safeTextContent(duration, experienceItem),
      this.helpers.safeTextContent(description, experienceItem),
      this.helpers.safeTextContent(roleName, experienceItem),
      companyURL,
    ]).then(([cn, tInterval, loc, dur, desc, rn, url]) => {
      const parsedCompanyName: string[] = cn.split('\n').filter((e) => e.length !== 0).map((e) => e.trim());
      const contractType = parsedCompanyName[1] ?? '';
      const splittedTimeInterval: string[] = splitDashes(tInterval);
      const dateInterval: DateInterval = {
        start: splittedTimeInterval[0]!.trim(),
        end: (
          (splittedTimeInterval.length === 2
            ? splittedTimeInterval[1]
            : splittedTimeInterval[0]
          )!).trim(),
      };
      return {
        company: {
          name: parsedCompanyName[0]!,
          linkedInURL: url,
        },
        location: loc,
        roles: [
          {
            description: desc,
            duration: dur,
            location: loc,
            name: rn,
            timeInterval: dateInterval,
            contractType,
          },
        ],
        totalDuration: dur,
      };
    });
  }
}
