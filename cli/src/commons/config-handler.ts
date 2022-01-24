import Configstore from 'configstore';
import * as fs from 'fs';
import * as path from 'path';

import { Services } from './services';

export default class ConfigHandler {
  // Enable the global config path to use this path to save browser dumps
  private readonly config: Configstore;

  private readonly service: Services;

  /**
   * Creates a new ConfigHandler instance
   * @param service The config handler for the given service
   * @param packageName The name of the CLI package
   */
  public constructor(service: Services, packageName: string) {
    this.service = service;
    this.config = new Configstore(packageName, { getConfigPath: true });
  }

  /**
   * Adds an account for the current service to the config store
   * @param service The service to add account to
   * @param username The username of account to add
   * @param password The password of the account to add
   */
  public addAccount(username: string, password: string) {
    this.config.set(`${this.service}.${username}`, password);
  }

  /**
   * Checks if an account exists in the current service
   * @param username The username of the account to check
   * @returns True if the given account exists in the given service
   */
  public checkAccount(username: string): boolean {
    return this.config.has(`${this.service}.${username}`);
  }

  /**
   * Get the path to save the authenticated browser context for the current service and given username
   * @param username The username of the account
   * @returns The path to save the authenticated browser context for the given service and given account
   */
  public getAuthContextPath(username: string): string {
    return path.join(path.dirname(this.config.path), `${this.service}_${username}.json`);
    // return path.join(`helloWorld.json`);
  }

  /**
   * Get the list of accounts for the current service
   * @returns The list of the accoutns
   */
  public getAcccounts(): string[] {
    return Object.keys(this.config.get(`${this.service}`));
  }
}
