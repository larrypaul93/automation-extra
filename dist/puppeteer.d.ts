import type * as pptr from 'puppeteer';
import type * as types from './types';
import { AutomationExtraBase } from './base';
export declare class PuppeteerExtra extends AutomationExtraBase implements types.PuppeteerBrowserLauncher {
    protected readonly vanillaLauncher: types.PuppeteerBrowserLauncher;
    constructor(_launcher?: types.PuppeteerBrowserLauncher);
    connect(options?: pptr.ConnectOptions): Promise<pptr.Browser>;
    launch(options?: pptr.LaunchOptions): Promise<pptr.Browser>;
    defaultArgs(options?: pptr.ChromeArgOptions): string[];
    executablePath(): string;
    createBrowserFetcher(options?: pptr.FetcherOptions): pptr.BrowserFetcher;
}
