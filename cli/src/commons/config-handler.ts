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
    this.config.set(`${this.getAccountPath(username)}.password`, password);
    this.config.set(`${this.getAccountPath(username)}.createdAt`, Date.now());
  }

  /**
   * Checks if an account exists in the current service
   * @param username The username of the account to check
   * @returns True if the given account exists in the given service
   */
  public checkAccount(username: string): boolean {
    return this.config.has(this.getAccountPath(username));
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
   * @returns The list of the accounts
   */
  public getAcccounts(): string[] {
    return Object.keys(this.config.get(`${this.service}`));
  }

  /**
   * Deletes the login information for the given account in the current service
   * @param username The username of the account
   */
  public removeAccount(username: string) {
    this.config.delete(this.getAccountPath(username));
    // If the deleted account is the default account, we need to remove default account too
    if (this.defaultAccount === username) {
      this.config.delete(this.defaultAccountPath);
    }
  }

  /**
   * Set the default account for the current service
   * @param username The username for the default account
   * @returns True if the default account updated sucessfully, false if not
   */
  public setDefaultAccount(username: string): boolean {
    if (this.checkAccount(username)) {
      this.config.set(this.defaultAccountPath, username);
      return true;
    }
    return false;
  }

  /**
   * Checks if there's a default account set for the current service
   * @returns True if the default account is set for the current service, false if not
   */
  public get hasDefaultAccount(): boolean {
    return this.config.has(this.defaultAccountPath);
  }

  /**
   * Get the default account for the current service
   * @returns The username for the default account for the current service, undefined if it does not exists
   */
  public get defaultAccount(): string | undefined {
    if (this.hasDefaultAccount) {
      return this.config.get(this.defaultAccountPath);
    }
    return undefined;
  }

  /**
   * Get the password of the account related to the username for the current service
   * @param username The username of the account
   * @returns The password of the account related to the username. If account does not exists, returns undefined
   */
  public getPassword(username: string): string | undefined {
    if (this.checkAccount(username)) {
      return this.config.get(`${this.getAccountPath(username)}.password`);
    }
    return undefined;
  }

  /**
   * Calculate the path in the config store for the current service and given username
   * @param username the username of the account to calculate the path
   * @returns The path in the config store for the given username and the current service
   */
  private getAccountPath(username: string): string {
    return `services.${this.service}.accounts.${username}`;
  }

  /**
   * Get the default account path in the configstore for the current service
   */
  private get defaultAccountPath(): string {
    return `services.${this.service}.selectedAccount`;
  }
}
