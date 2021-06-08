import { Debugger } from 'debug';
import TypedEmitter from 'typed-emitter';
import type * as Playwright from 'playwright-core';
import type * as Puppeteer from 'puppeteer';
export type { Puppeteer, Playwright };
import type { ProtocolConnectionBase } from '@tracerbench/protocol-connection';
export interface PluginOptions {
    [key: string]: any;
}
/** Like `Partial<>` but with nested property support */
export declare type NestedPartial<T> = {
    [K in keyof T]?: T[K] extends Array<infer R> ? Array<NestedPartial<R>> : NestedPartial<T[K]>;
};
export interface LaunchContext {
    context: 'launch' | 'connect';
    isHeadless: boolean;
    options: Puppeteer.LaunchOptions | Playwright.LaunchOptions | any;
}
export declare type PluginDependencies = Set<string> | Map<string, any>;
export declare type PluginRequirements = Set<'launch' | 'headful' | 'runLast'>;
export declare type LaunchOptions = Puppeteer.LaunchOptions | Playwright.LaunchOptions;
export declare type ConnectOptions = Puppeteer.ConnectOptions | Playwright.ConnectOptions;
export declare type Browser = Puppeteer.Browser | Playwright.Browser;
export declare type Page = Puppeteer.Page | Playwright.Page;
export declare type Worker = Puppeteer.Worker | Playwright.Worker;
/**
 * Minimal plugin interface
 * @private
 */
export interface MinimalPlugin {
    _isAutomationExtraPlugin: boolean;
    [propName: string]: any;
}
/**
 * Filters
 * @private
 */
export declare type FilterString = 'playwright:chromium' | 'playwright:firefox' | 'playwright:webkit' | 'puppeteer:chromium' | 'puppeteer:firefox';
export interface FilterInclude {
    include: FilterString[];
    exclude?: never;
}
export interface FilterExclude {
    include?: never;
    exclude: FilterString[];
}
export declare type Filter = FilterInclude | FilterExclude;
/**
 * Plugin lifecycle methods used by AutomationExtraPlugin.
 *
 * These are hooking into Playwright/Puppeteer events and are meant to be overriden
 * on a per-need basis in your own plugin extending AutomationExtraPlugin.
 *
 * @class PluginLifecycleMethods
 */
export declare class PluginLifecycleMethods {
    /**
     * After the plugin has been registered, called early in the life-cycle (once the plugin has been added).
     */
    onPluginRegistered(): Promise<void>;
    /**
     * Before a new browser instance is created/launched.
     *
     * Can be used to modify the puppeteer/playwright launch options by modifying or returning them.
     *
     * Plugins using this method will be called in sequence to each
     * be able to update the launch options.
     *
     * @example
     * async beforeLaunch (options) {
     *   if (this.opts.flashPluginPath) {
     *     options.args = options.args || []
     *     options.args.push(`--ppapi-flash-path=${this.opts.flashPluginPath}`)
     *   }
     * }
     *
     * @param options - Puppeteer/Playwright launch options
     */
    beforeLaunch(options: LaunchOptions): Promise<LaunchOptions | void>;
    /**
     * After the browser has launched.
     *
     * Note: Don't assume that there will only be a single browser instance during the lifecycle of a plugin.
     * It's possible that `pupeeteer.launch` will be  called multiple times and more than one browser created.
     * In order to make the plugins as stateless as possible don't store a reference to the browser instance
     * in the plugin but rather consider alternatives.
     *
     * E.g. when using `onPageCreated` you can get a browser reference by using `page.browser()`.
     *
     * Alternatively you could expose a class method that takes a browser instance as a parameter to work with:
     *
     * ```es6
     * const fancyPlugin = require('puppeteer-extra-plugin-fancy')()
     * puppeteer.use(fancyPlugin)
     * const browser = await puppeteer.launch()
     * await fancyPlugin.killBrowser(browser)
     * ```
     *
     * @param  browser - The `puppeteer` or `playwright` browser instance.
     *
     * @example
     * async afterLaunch (browser, opts) {
     *   this.debug('browser has been launched', opts.options)
     * }
     */
    afterLaunch(browser: Browser, launchContext: LaunchContext): Promise<void>;
    /**
     * Before connecting to an existing browser instance.
     *
     * Can be used to modify the puppeteer/playwright connect options by modifying or returning them.
     *
     * Plugins using this method will be called in sequence to each
     * be able to update the launch options.
     *
     * @param options - Puppeteer/playwright connect options
     */
    beforeConnect(options: ConnectOptions): Promise<ConnectOptions | void>;
    /**
     * After connecting to an existing browser instance.
     *
     * > Note: Don't assume that there will only be a single browser instance during the lifecycle of a plugin.
     *
     * @param browser - The `puppeteer` or playwright browser instance.
     *
     */
    afterConnect(browser: Browser, launchContext: LaunchContext): Promise<void>;
    /**
     * Called when a browser instance is available.
     *
     * This applies to both `launch` and `connect`.
     *
     * Convenience method created for plugins that need access to a browser instance
     * and don't mind if it has been created through `launch` or `connect`.
     *
     * > Note: Don't assume that there will only be a single browser instance during the lifecycle of a plugin.
     *
     * @param browser - The `puppeteer` or `playwright` browser instance.
     */
    onBrowser(browser: Browser, launchContext: LaunchContext): Promise<void>;
    /**
     * Before a new browser context is created.
     *
     * Note: Currently only triggered by `playwright`, as puppeteer's usage of context is very lackluster.
     *
     * Plugins using this method will be called in sequence to each
     * be able to update the context options.
     *
     * @see https://github.com/microsoft/playwright/blob/master/docs/api.md#browsernewcontextoptions
     *
     * @param options - Playwright browser context options
     * @param browser - Playwright browser
     */
    beforeContext(options: Playwright.BrowserContextOptions, browser: Playwright.Browser): Promise<Playwright.BrowserContextOptions | void>;
    /**
     * After a new browser context has been created.
     *
     * Note: `playwright` specific.
     *
     * @param  options - Playwright browser context options
     * @param  context - Playwright browser context
     */
    onContextCreated(context: Playwright.BrowserContext, options: Playwright.BrowserContextOptions): Promise<void>;
    /**
     * Called when a page has been created.
     *
     * The event will also fire for popup pages.
     *
     * @see https://playwright.dev/#version=v1.3.0&path=docs%2Fapi.md&q=event-page
     * @see https://pptr.dev/#?product=Puppeteer&version=main&show=api-event-targetcreated
     *
     * @param  {Puppeteer.Page|Playwright.Page} page
     * @example
     * async onPageCreated (page) {
     *   let ua = await page.browser().userAgent()
     *   if (this.opts.stripHeadless) {
     *     ua = ua.replace('HeadlessChrome/', 'Chrome/')
     *   }
     *   this.debug('new ua', ua)
     *   await page.setUserAgent(ua)
     * }
     */
    onPageCreated(page: Page): Promise<void>;
    /**
     * Called when a page has been closed.
     *
     */
    onPageClose(page: Page): Promise<void>;
    /**
     * Called when a worker has been created.
     *
     * This is a unified event for dedicated, service and shared workers.
     */
    onWorkerCreated(worker: Puppeteer.Worker | Playwright.Worker): Promise<void>;
    /**
     * Called when a browser context has been closed.
     *
     * Note: `playwright` specific.
     *
     */
    onContextClose(context: Playwright.BrowserContext): Promise<void>;
    /**
     * Called when the browser got disconnected.
     *
     * This might happen because of one of the following:
     * - The browser is closed or crashed
     * - The `browser.disconnect` method was called
     *
     * @param browser - The `puppeteer` or `playwright` browser instance.
     */
    onDisconnected(browser: Browser): Promise<void>;
}
/**
 * AutomationExtraPlugin - Meant to be used as a base class and it's methods overridden.
 *
 * Implements all `PluginLifecycleMethods`.
 *
 * @class AutomationExtraPlugin
 * @extends {PluginLifecycleMethods}
 * @example
 *   class Plugin extends AutomationExtraPlugin {
 *     static id = 'foobar'
 *     constructor(opts = {}) {
 *       super(opts)
 *     }
 *
 *     async beforeLaunch(options) {
 *       options.headless = false
 *       return options
 *     }
 *   }
 */
export declare abstract class AutomationExtraPlugin<Opts = PluginOptions> extends PluginLifecycleMethods {
    /** @private */
    ['constructor']: typeof AutomationExtraPlugin;
    /** @private */
    private _debugBase;
    /** @private */
    private _opts;
    /**
     * Plugin id/name (required)
     *
     * Convention:
     * - Package: `automation-extra-plugin-anonymize-ua`
     * - Name: `anonymize-ua`
     *
     * @example
     * static id = 'anonymize-ua';
     * // or
     * static get id() {
     *   return 'anonymize-ua'
     * }
     */
    static id: string;
    /**
     * @private
     */
    private _env;
    constructor(opts?: NestedPartial<Opts>);
    /**
     * Access the static id property of the Plugin in an instance.
     *
     * @example
     * static id = 'anonymize-ua';
     * @private
     */
    get id(): string;
    /**
     * Backwards compatibility, use a `static id` property instead.
     * @private
     */
    get name(): string;
    /** Unified Page methods for Playwright & Puppeteer */
    shim(page: Page): PageShim;
    /**
     * Plugin defaults (optional).
     *
     * If defined will be ([deep-](https://github.com/TehShrike/deepmerge))merged with the (optional) user supplied options (supplied during plugin instantiation).
     *
     * The result of merging defaults with user supplied options can be accessed through `this.opts`.
     *
     * @see [[opts]]
     *
     * @example
     * get defaults () {
     *   return {
     *     stripHeadless: true,
     *     makeWindows: true,
     *     customFn: null
     *   }
     * }
     *
     * // Users can overwrite plugin defaults during instantiation:
     * puppeteer.use(require('puppeteer-extra-plugin-foobar')({ makeWindows: false }))
     */
    get defaults(): Opts;
    /**
     * Plugin requirements (optional).
     *
     * Signal certain plugin requirements to the base class and the user.
     *
     * Currently supported:
     * - `launch`
     *   - If the plugin only supports locally created browser instances (no `puppeteer.connect()`),
     *     will output a warning to the user.
     * - `headful`
     *   - If the plugin doesn't work in `headless: true` mode,
     *     will output a warning to the user.
     * - `runLast`
     *   - In case the plugin prefers to run after the others.
     *     Useful when the plugin needs data from others.
     *
     * @note
     * The plugin code will still be executed, only a warning will be shown to the user.
     *
     * @example
     * get requirements () {
     *   return new Set(['runLast', 'dataFromPlugins'])
     * }
     */
    get requirements(): PluginRequirements;
    /**
     * Plugin filter statements (optional).
     *
     * Filter this plugin from being called depending on the environment.
     *
     * @note
     * `include` or `exclude` are mutually exclusive, use one or the other.
     *
     * @example
     * get filter() {
     *   return {
     *     include: ['playwright:chromium', 'puppeteer:chromium']
     *   }
     * }
     */
    get filter(): Filter | undefined;
    /**
     * Plugin dependencies (optional).
     *
     * Missing plugins will be required() by automation-extra.
     *
     * @note
     * Look into using `plugins` instead if you want to avoid dynamic imports.
     *
     * @example
     * // Will ensure the 'puppeteer-extra-plugin-user-preferences' plugin is loaded.
     * get dependencies () {
     *   return new Set(['user-preferences'])
     * }
     *
     * // Will load `user-preferences` plugin and pass `{ beCool: true }` as opts
     * get dependencies () {
     *   return new Map([['user-preferences', { beCool: true }]])
     * }
     *
     */
    get dependencies(): PluginDependencies;
    /**
     * Add additional plugins (optional).
     *
     * Expects an array of AutomationExtraPlugin instances, not classes.
     * This is intended to be used by "meta" plugins that use other plugins behind the scenes.
     *
     * The benefit over using `dependencies` is that this doesn't use the framework for dynamic imports,
     * but requires explicit imports which bundlers like webkit handle much better.
     *
     * Missing plugins listed here will be added at the start of `launch` or `connect` events.
     */
    get plugins(): MinimalPlugin[];
    /**
     * Access the plugin options (usually the `defaults` merged with user defined options)
     *
     * To skip the auto-merging of defaults with user supplied opts don't define a `defaults`
     * property and set the `this._opts` Object in your plugin constructor directly.
     *
     * @see [[defaults]]
     *
     * @example
     * get defaults () { return { foo: "bar" } }
     *
     * async onPageCreated (page) {
     *   this.debug(this.opts.foo) // => bar
     * }
     */
    get opts(): Opts;
    /**
     *  Convenience debug logger based on the [debug] module.
     *  Will automatically namespace the logging output to the plugin package name.
     *  [debug]: https://www.npmjs.com/package/debug
     *
     *  ```bash
     *  # toggle output using environment variables
     *  DEBUG=automation-extra-plugin:<plugin_id> node foo.js
     *  # to debug all the things:
     *  DEBUG=automation-extra,automation-extra-plugin:* node foo.js
     *  ```
     *
     * @example
     * this.debug('hello world')
     * // will output e.g. 'automation-extra-plugin:anonymize-ua hello world'
     */
    get debug(): Debugger;
    /**
     * Contains info regarding the launcher environment the plugin runs in
     * @see LauncherEnv
     */
    get env(): LauncherEnv;
    /** @private */
    set env(env: LauncherEnv);
    /**
     * @private
     */
    get _isAutomationExtraPlugin(): boolean;
}
export declare type SupportedDrivers = 'playwright' | 'puppeteer';
export declare type BrowserEngines = 'chromium' | 'firefox' | 'webkit';
/**
 * TypeGuards: They allow differentiating between different objects and types.
 *
 * Type guards work by discriminating against properties only found in that specific type.
 * This is especially useful when used with TypeScript as it improves type safety.
 *
 * @class TypeGuards
 * @abstract
 */
export declare class TypeGuards {
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPage(obj: any): obj is Puppeteer.Page | Playwright.Page;
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isBrowser(obj: any): obj is Puppeteer.Browser | Playwright.Browser;
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPuppeteerPage(obj: any): obj is Puppeteer.Page;
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPuppeteerBrowser(obj: any): obj is Puppeteer.Browser;
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPuppeteerBrowserContext(obj: any): obj is Puppeteer.BrowserContext;
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPlaywrightPage(obj: any): obj is Playwright.Page;
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPlaywrightBrowser(obj: any): obj is Playwright.Browser;
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPlaywrightBrowserContext(obj: any): obj is Playwright.BrowserContext;
}
/**
 * Stores environment specific info, populated by the launcher.
 * This allows sane plugin development in a multi-browser, multi-driver environment.
 *
 * @class LauncherEnv
 * @extends {TypeGuards}
 */
export declare class LauncherEnv extends TypeGuards {
    /**
     * The name of the driver currently in use: `"playwright" | "puppeteer"`.
     */
    driverName: SupportedDrivers | 'unknown';
    /**
     * The name of the browser engine currently in use: `"chromium" | "firefox" | "webkit" | "unknown"`.
     *
     * Note: With puppeteer the browser will only be known once a browser object is available (after launching or connecting),
     * as they support defining the browser during `.launch()`.
     */
    browserName: BrowserEngines | 'unknown';
    /**
     * EventEmitter for all plugin lifecycle events
     */
    events: TypedEmitter<PluginLifecycleMethods>;
    /** @private */
    constructor(driverName?: SupportedDrivers | 'unknown');
    /** Check if current driver is puppeteer */
    get isPuppeteer(): boolean;
    /** Check if current driver is playwright */
    get isPlaywright(): boolean;
    /** Check if current browser is chrome or chromium */
    get isChromium(): boolean;
    /** Check if current browser is firefox */
    get isFirefox(): boolean;
    /** Check if current browser is webkit */
    get isWebkit(): boolean;
    /** Check if current browser is known */
    get isBrowserKnown(): boolean;
}
/**
 * Can be converted to JSON
 * @private
 */
declare type Serializable = {};
export declare type CDPSession = Pick<ProtocolConnectionBase, 'send' | 'on'>;
/**
 * Unified Page methods for Playwright & Puppeteer.
 * They support common actions through a single API.
 *
 * @class PageShim
 */
export declare class PageShim {
    private env;
    private page;
    private unsupportedShimError;
    constructor(env: LauncherEnv, page: Page);
    /**
     * Adds a script which would be evaluated in one of the following scenarios:
     *
     * Whenever the page is navigated.
     * Whenever the child frame is attached or navigated. In this case, the script is evaluated in the context of the newly attached frame.
     *
     * The script is evaluated after the document was created but before any of its scripts were run.
     *
     * @see
     * **Playwright:** `addInitScript`
     * **Puppeteer:** `evaluateOnNewDocument`
     */
    addScript(script: string | Function, arg?: Serializable): Promise<void>;
    /**
     * Chromium browsers only: Return a fully typed CDP session.
     *
     * @see https://playwright.dev/docs/api/class-cdpsession/
     * @see https://pptr.dev/#?product=Puppeteer&version=v7.0.4&show=api-class-cdpsession
     */
    getCDPSession(): Promise<Pick<ProtocolConnectionBase, "send" | "on">>;
}
