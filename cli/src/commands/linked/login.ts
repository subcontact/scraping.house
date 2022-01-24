import { Command, Flags } from '@oclif/core';
import cli from 'cli-ux';
import ConfigHandler from '../../commons/config-handler';
import { Services } from '../../commons/services';
import Linked from '@scraping.house/linked';

export default class LinkedLogin extends Command {
  private readonly configHandler: ConfigHandler = new ConfigHandler(Services.Linked, this.config.name);

  static description = 'login to LinkedIn account';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    // Username of the user (-u, --username=VALUE)
    username: Flags.string({ char: 'u', description: 'LinkedIn username', required: true }),
    password: Flags.string({ char: 'p', description: 'LinkedIn password', required: false }),
    cookiePath: Flags.string({ description: 'The path to save cookie file to', required: false }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: 'f', description: 'Override existing configuration' }),
    headless: Flags.boolean({ description: 'Use browser in headless mode', allowNo: true, default: true })
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(LinkedLogin);

    this.log(`Username to login ${flags.username}`);

    // Check if the account exists
    if (this.configHandler.checkAccount(flags.username)) {
      // If the LinkedIn account already exists check if the force flag is present
      if (!flags.force) {
        // If the force flag does not exists, confirm the override operation
        const willContinue: boolean = await cli.confirm(
          `A LinkedIn account already exists for ${flags.username}, do you want to override it?`
        );
        if (!willContinue) {
          this.log(`Will not override the existing credentials for ${flags.username}`);
          this.exit(0);
        }
      }
    }

    if (flags.password === undefined) {
      flags.password = await cli.prompt(`What's your LinkedIn password for ${flags.username}`, {
        type: 'hide'
      });
    }
    // Try to login before continue
    this.log(
      `Authenticated browser context will be saved to ${this.configHandler.getAuthContextPath(
        flags.username
      )}`
    );
    const linkedin = await Linked.init(
      'firefox',
      { headless: flags.headless },
      undefined,
      this.configHandler.getAuthContextPath(flags.username)
    );
    this.log(`Navigated to the LinkedIn home page`);
    await linkedin.login(flags.username, flags.password!);
    this.log(`Logged in to the LinkedIn`);
    await linkedin.close();
    this.log('Login to LinkedIn completed');
    this.configHandler.addAccount(flags.username, flags.password!);
    this.log('Account added to the configstore');
  }
}
