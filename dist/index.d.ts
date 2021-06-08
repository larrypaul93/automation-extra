import type { PlaywrightBrowserLauncher, PuppeteerBrowserLauncher } from './types';
import type * as pw from 'playwright-core';
import type * as pptr from 'puppeteer';
import { PlaywrightExtra } from './playwright';
import { PuppeteerExtra } from './puppeteer';
export * from './types';
export type { pw as Playwright };
export type { pptr as Puppeteer };
export { PlaywrightExtra } from './playwright';
export { PuppeteerExtra } from './puppeteer';
export { AutomationExtraBase } from './base';
/**
 * Augment a Puppeteer or Playwright API compatible browser launcher with plugin functionality.
 * Note: We can't use `addExtra` here as we wildcard export this file in `playwright-extra` and `puppeteer-extra`
 *
 * @param launcher - Puppeteer or Playwright API compatible browser launcher
 * @private
 */
export declare const _addExtra: (launcher: PuppeteerBrowserLauncher | PlaywrightBrowserLauncher) => PuppeteerExtra | PlaywrightExtra;
/**
 * Augment the provided Playwright browser launcher with plugin functionality.
 *
 * @example
 * import playwright from 'playwright'
 * const chromium = addExtra(playwright.chromium)
 * chromium.use(plugin)
 *
 * @param launcher - Playwright (or compatible) browser launcher
 */
export declare const addExtraPlaywright: (launcher: PlaywrightBrowserLauncher) => PlaywrightExtra;
/**
 * Augment the provided Puppeteer browser launcher with plugin functionality.
 *
 * @example
 * import vanillaPuppeteer from 'puppeteer'
 * const puppeteer = addExtra(vanillaPuppeteer)
 * puppeteer.use(plugin)
 *
 * @param launcher - Puppeteer (or compatible) browser launcher
 */
export declare const addExtraPuppeteer: (launcher: PuppeteerBrowserLauncher) => PuppeteerExtra;
