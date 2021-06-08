import type * as pw from 'playwright-core';
import type * as types from './types';
import { AutomationExtraBase } from './base';
export declare class PlaywrightExtra extends AutomationExtraBase implements types.PlaywrightBrowserLauncher {
    protected readonly vanillaLauncher: types.PlaywrightBrowserLauncher;
    constructor(_launcherOrBrowserName: types.PlaywrightBrowserLauncher | types.PlaywrightBrowsers);
    connect(options: pw.ConnectOptions): Promise<pw.Browser>;
    launch(options?: pw.LaunchOptions): Promise<pw.Browser>;
    connectOverCDP(params: pw.ConnectOverCDPOptions): Promise<pw.Browser>;
    connectOverCDP(params: pw.ConnectOptions): Promise<pw.Browser>;
    launchPersistentContext(userDataDir: string, options?: any): Promise<pw.BrowserContext>;
    launchServer(options?: any): Promise<pw.BrowserServer>;
    executablePath(): string;
    name(): string;
}
