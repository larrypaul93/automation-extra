import type * as pw from 'playwright-core';
import type * as pptr from 'puppeteer';
import type * as types from './types';
import { LauncherEnv } from 'automation-extra-plugin';
import { PluginList } from './plugins';
export declare class AutomationExtraBase {
    protected _launcher?: types.PuppeteerBrowserLauncher | types.PlaywrightBrowserLauncher | undefined;
    /** Information about the launcher environment */
    readonly env: LauncherEnv;
    /** List of plugins */
    readonly plugins: PluginList;
    constructor(driverName: types.SupportedDrivers, _launcher?: types.PuppeteerBrowserLauncher | types.PlaywrightBrowserLauncher | undefined);
    /**
     * The **main interface** to register plugins.
     *
     * @example
     * puppeteer.use(plugin1).use(plugin2)
     * // or
     * chromium.use(plugin1).use(plugin2)
     * firefox.use(plugin1).use(plugin2)
     *
     * @see [AutomationExtraPlugin]
     *
     * @return The same `PuppeteerExtra` or `PlaywrightExtra` instance (for optional chaining)
     */
    use(plugin: types.Plugin): this;
    /**
     * In order to support a default export which will require vanilla puppeteer or playwright automatically,
     * as well as named exports to patch the provided launcher, we need to so some gymnastics here unfortunately.
     *
     * If we just do e.g. `require('puppeteer')` in our default export this would throw immediately,
     * even when only using the `addExtra` export in combination with `puppeteer-core`. :-/
     *
     * The solution is to make the vanilla launcher optional and only throw once we try to effectively use and can't find it.
     */
    protected get launcher(): types.BrowserLauncher;
    protected _bindPuppeteerBrowserEvents(browser: pptr.Browser): Promise<void>;
    protected _bindPlaywrightBrowserEvents(browser: pw.Browser): Promise<void>;
    /**
     * Puppeteer: Patch page creation methods (both regular and incognito contexts).
     *
     * Unfortunately it's possible that the `targetcreated` events are not triggered
     * early enough for listeners (e.g. plugins using `onPageCreated`) to be able to
     * modify the page instance (e.g. user-agent) before the browser request occurs.
     *
     * This only affects the first request of a newly created page target.
     *
     * As a workaround I've noticed that navigating to `about:blank` (again),
     * right after a page has been created reliably fixes this issue and adds
     * no noticable delay or side-effects.
     *
     * This problem is not specific to `puppeteer-extra` but default Puppeteer behaviour.
     *
     * Note: This patch only fixes explicitly created pages, implicitly created ones
     * (e.g. through `window.open`) are still subject to this issue. I didn't find a
     * reliable mitigation for implicitly created pages yet.
     *
     * Puppeteer issues:
     * https://github.com/GoogleChrome/puppeteer/issues/2669
     * https://github.com/puppeteer/puppeteer/issues/3667
     * https://github.com/GoogleChrome/puppeteer/issues/386#issuecomment-343059315
     * https://github.com/GoogleChrome/puppeteer/issues/1378#issue-273733905
     *
     * @private
     */
    private _patchPageCreationMethods;
    protected _requireLauncherOrThrow(): any;
}
