import { Command, Flags } from '@oclif/core';
import Linked, { UserProfile } from '@scraping.house/linked';

import ConfigHandler from '../../commons/config-handler';
import { Services } from '../../commons/services';

export default class LinkedProfile extends Command {
  static description = 'scrape information from a LinkedIn user profile';
  private readonly configHandler: ConfigHandler = new ConfigHandler(Services.Linked, this.config.name);

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    // flag with a value (-n, --name=VALUE)
    id: Flags.string({ char: 'i', description: 'The if of the LinkedIn user to scrape', required: true }),
    username: Flags.string({
      char: 'u',
      description: 'The username of the LinkedIn account to use',
      required: false
    }),
    output: Flags.string({
      char: 'o',
      description: 'The output file path',
      required: false
    }),
    format: Flags.string({
      description: 'The format of the output',
      required: false,
      options: ['csv', 'json'],
      default: 'json'
    }),
    // flag with no value (-f, --force)
    full: Flags.boolean({ description: 'Get the full profile' }),
    education: Flags.boolean({ description: 'Get education information of the user' }),
    experiences: Flags.boolean({ description: 'Get education of the user' }),
    certificates: Flags.boolean({ description: 'Get certifications of the user' }),
    fullName: Flags.boolean({ description: "Get the user's full name" }),
    shortDescription: Flags.boolean({ description: "Get the user's short description" }),
    location: Flags.boolean({ description: 'Get the location of the user' }),
    about: Flags.boolean({ description: 'Get the about text of the user' }),
    isPremium: Flags.boolean({
      description: 'Check if the user has LinkedIn premium badge on their account'
    }),
    isInfluencer: Flags.boolean({
      description: 'Check if the user has LinkedIn influencer badge on their account'
    }),
    // TODO: Add other flags for other selectors
    incognito: Flags.boolean({ description: 'Enables the incognito mode (without any authentication)' }),
    headless: Flags.boolean({ description: 'Enables the headless browsing', default: true, allowNo: true })
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(LinkedProfile);

    // Check if a username is provided
    if (flags.username === undefined && !flags.incognito) {
      // If there's no username provided and incognito mode is disabled set the username to the default account
      flags.username = this.configHandler.defaultAccount;
    }

    if (flags.username !== undefined && !this.configHandler.checkAccount(flags.username)) {
      // If the username is defined and it does not exists fail
      this.error(`No account exists with username ${flags.username}.`);
    }

    const linkedin = await Linked.init(
      'firefox',
      { headless: flags.headless },
      undefined,
      flags.username === undefined ? undefined : this.configHandler.getAuthContextPath(flags.username)
    );

    const userProfile = await linkedin.user(flags.id, false);

    // Check if the --full flag provided
    if (flags.full) {
      // If the --full flag provided enable all other flags
      flags.education = true;
      flags.experiences = true;
      flags.certificates = true;
      flags.fullName = true;
      flags.shortDescription = true;
      flags.location = true;
      flags.about = true;
      flags.isPremium = true;
      flags.isInfluencer = true;
    }

    const result: UserProfile = {};

    if (flags.education) {
      result.educations = await userProfile.education();
    }

    if (flags.experiences) {
      result.experiences = await userProfile.experiences();
    }

    if (flags.certificates) {
      result.certificates = await userProfile.certifications();
    }

    if (flags.fullName) {
      result.fullName = await userProfile.fullName();
    }

    if (flags.shortDescription) {
      result.shortDescription = await userProfile.shortDescription();
    }

    if (flags.location) {
      result.location = await userProfile.location();
    }

    if (flags.about) {
      result.about = await userProfile.about();
    }

    if (flags.isPremium) {
      result.isPremium = await userProfile.isPremium();
    }

    if (flags.isInfluencer) {
      result.isInfluencer = await userProfile.isInfluencer();
    }
    await linkedin.close();
    this.log(JSON.stringify(result, undefined, 4));

    // TODO: Convert output to other formats
    // TODO: Handle save
  }
}
