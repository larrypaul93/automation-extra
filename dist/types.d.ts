import type * as pw from 'playwright-core';
import type * as pptr from 'puppeteer';
export declare type SupportedDrivers = 'playwright' | 'puppeteer';
export interface PuppeteerBrowserLauncher {
    /** Attaches Puppeteer to an existing Chromium instance */
    connect: (options?: pptr.ConnectOptions) => Promise<pptr.Browser>;
    /** The default flags that Chromium will be launched with */
    defaultArgs: (options?: pptr.ChromeArgOptions) => string[];
    /** Path where Puppeteer expects to find bundled Chromium */
    executablePath: () => string;
    /** The method launches a browser instance with given arguments. The browser will be closed when the parent node.js process is closed. */
    launch: (options?: pptr.LaunchOptions) => Promise<pptr.Browser>;
    /** This methods attaches Puppeteer to an existing Chromium instance. */
    createBrowserFetcher: (options?: pptr.FetcherOptions) => pptr.BrowserFetcher;
}
export declare type PlaywrightBrowserLauncher = pw.BrowserType<pw.Browser>;
export declare type BrowserLauncher = PuppeteerBrowserLauncher | PlaywrightBrowserLauncher;
export declare type Browser = pptr.Browser | pw.Browser;
export declare type PlaywrightBrowsers = 'chromium' | 'firefox' | 'webkit';
export declare type PuppeteerBrowsers = 'chrome' | 'firefox';
export declare type PlaywrightBrowser = pw.ChromiumBrowser | pw.FirefoxBrowser | pw.WebKitBrowser;
export declare type ConnectOptions = pptr.ConnectOptions | pw.ConnectOptions;
export declare type LaunchOptions = pptr.LaunchOptions | pw.LaunchOptions;
import type { AutomationExtraPlugin, LaunchContext, PluginLifecycleMethods } from 'automation-extra-plugin';
import type { PuppeteerExtraPlugin } from 'puppeteer-extra-plugin';
export { AutomationExtraPlugin, PluginLifecycleMethods, PuppeteerExtraPlugin, LaunchContext };
export declare type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
export declare type PluginMethodNames = keyof PluginLifecycleMethods;
export declare type PluginMethodFn<TName extends PluginMethodNames> = PropType<PluginLifecycleMethods, TName>;
export declare type LegacyPluginMethodNames = 'onTargetCreated' | 'onTargetChanged' | 'onTargetDestroyed' | 'onClose';
export declare type LegacyPluginMethodFn<TName extends LegacyPluginMethodNames> = PropType<PuppeteerExtraPlugin, TName>;
export declare type Plugin = PuppeteerExtraPlugin | AutomationExtraPlugin;
