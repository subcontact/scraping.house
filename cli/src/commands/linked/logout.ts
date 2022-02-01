import { Command, Flags } from '@oclif/core';
import { cli } from 'cli-ux';
import { unlinkSync } from 'fs';
import ConfigHandler from '../../commons/config-handler';
import { Services } from '../../commons/services';

export default class LinkedLogout extends Command {
  private readonly configHandler: ConfigHandler = new ConfigHandler(Services.Linked, this.config.name);

  static description = 'remove the saved LinkedIn account';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    username: Flags.string({ char: 'u', description: 'username of the account to remove', required: false })
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(LinkedLogout);
    if (flags.username === undefined) {
      flags.username = await cli.prompt("What's the username of the account to remove ?", { type: 'normal' });
    }
    const confirmed: boolean = await cli.prompt(
      'This will remove all saved data for this account including login information and all advanced settings. This action is inreversible, do you want to proceed?'
    );
    if (!confirmed) {
      this.exit(1);
    }
    this.configHandler.removeAccount(flags.username!);
    unlinkSync(this.configHandler.getAuthContextPath(flags.username!));
  }
}
