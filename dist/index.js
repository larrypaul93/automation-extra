"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageShim = exports.LauncherEnv = exports.TypeGuards = exports.AutomationExtraPlugin = exports.PluginLifecycleMethods = void 0;
const debug_1 = require("debug");
const events_1 = require("events");
// We use dummy/noop functions in PluginLifecycleMethods meant to be overriden
/* tslint:disable:no-empty */
/** @private */
const merge = require('deepmerge');
const is_plain_object_1 = require("is-plain-object");
const mergeOptions = { isMergeableObject: is_plain_object_1.isPlainObject };
/**
 * Plugin lifecycle methods used by AutomationExtraPlugin.
 *
 * These are hooking into Playwright/Puppeteer events and are meant to be overriden
 * on a per-need basis in your own plugin extending AutomationExtraPlugin.
 *
 * @class PluginLifecycleMethods
 */
class PluginLifecycleMethods {
    /**
     * After the plugin has been registered, called early in the life-cycle (once the plugin has been added).
     */
    async onPluginRegistered() { }
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
    async beforeLaunch(options) { }
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
    async afterLaunch(browser, launchContext) { }
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
    async beforeConnect(options) { }
    /**
     * After connecting to an existing browser instance.
     *
     * > Note: Don't assume that there will only be a single browser instance during the lifecycle of a plugin.
     *
     * @param browser - The `puppeteer` or playwright browser instance.
     *
     */
    async afterConnect(browser, launchContext) { }
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
    async onBrowser(browser, launchContext) { }
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
    async beforeContext(options, browser) { }
    /**
     * After a new browser context has been created.
     *
     * Note: `playwright` specific.
     *
     * @param  options - Playwright browser context options
     * @param  context - Playwright browser context
     */
    async onContextCreated(context, options) { }
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
    async onPageCreated(page) { }
    /**
     * Called when a page has been closed.
     *
     */
    async onPageClose(page) { }
    /**
     * Called when a worker has been created.
     *
     * This is a unified event for dedicated, service and shared workers.
     */
    async onWorkerCreated(worker) { }
    /**
     * Called when a browser context has been closed.
     *
     * Note: `playwright` specific.
     *
     */
    async onContextClose(context) { }
    /**
     * Called when the browser got disconnected.
     *
     * This might happen because of one of the following:
     * - The browser is closed or crashed
     * - The `browser.disconnect` method was called
     *
     * @param browser - The `puppeteer` or `playwright` browser instance.
     */
    async onDisconnected(browser) { }
}
exports.PluginLifecycleMethods = PluginLifecycleMethods;
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
class AutomationExtraPlugin extends PluginLifecycleMethods {
    constructor(opts) {
        super();
        this._debugBase = debug_1.default(`automation-extra-plugin:base:${this.id}`);
        this._opts = merge(this.defaults, opts || {}, mergeOptions);
        // this.env = new LauncherEnv()
        this._debugBase('Initialized.');
    }
    /**
     * Access the static id property of the Plugin in an instance.
     *
     * @example
     * static id = 'anonymize-ua';
     * @private
     */
    get id() {
        if (this.constructor.id === 'base-plugin') {
            throw new Error('Plugin must override "id"'); // If you encountered this: Add `static id = 'foobar'` to your class
        }
        return this.constructor.id;
    }
    /**
     * Backwards compatibility, use a `static id` property instead.
     * @private
     */
    get name() {
        return this.id;
    }
    shim(obj) {
        if (this.env.isPage(obj)) {
            return new PageShim(this.env, obj);
        }
        throw new Error(`Unsupported shim: (isPage: ${this.env.isPage(obj)})`);
    }
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
    get defaults() {
        return {};
    }
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
    get requirements() {
        return new Set([]);
    }
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
    get filter() {
        return;
    }
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
    get dependencies() {
        return new Set([]);
    }
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
    get plugins() {
        return [];
    }
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
    get opts() {
        return this._opts;
    }
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
    get debug() {
        return debug_1.default(`automation-extra-plugin:${this.id}`);
    }
    /**
     * Contains info regarding the launcher environment the plugin runs in
     * @see LauncherEnv
     */
    get env() {
        if (!this._env) {
            throw new Error('Launcher env not available yet, you need to register the plugin before using it.');
        }
        return this._env;
    }
    /** @private */
    set env(env) {
        this._env = env;
    }
    /**
     * @private
     */
    get _isAutomationExtraPlugin() {
        return true;
    }
}
exports.AutomationExtraPlugin = AutomationExtraPlugin;
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
AutomationExtraPlugin.id = 'base-plugin';
/**
 * TypeGuards: They allow differentiating between different objects and types.
 *
 * Type guards work by discriminating against properties only found in that specific type.
 * This is especially useful when used with TypeScript as it improves type safety.
 *
 * @class TypeGuards
 * @abstract
 */
class TypeGuards {
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPage(obj) {
        return 'goto' in obj && 'url' in obj;
    }
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isBrowser(obj) {
        return 'newPage' in obj && 'close' in obj;
    }
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPuppeteerPage(obj) {
        return 'setUserAgent' in obj;
    }
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPuppeteerBrowser(obj) {
        return 'createIncognitoBrowserContext' in obj;
    }
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPuppeteerBrowserContext(obj) {
        return 'clearPermissionOverrides' in obj;
    }
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPlaywrightPage(obj) {
        return 'unroute' in obj;
    }
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPlaywrightBrowser(obj) {
        return 'newContext' in obj;
    }
    /**
     * Type guard, will make TypeScript understand which type we're working with.
     * @param obj - The object to test
     * @returns {boolean}
     */
    isPlaywrightBrowserContext(obj) {
        return 'addCookies' in obj;
    }
}
exports.TypeGuards = TypeGuards;
/**
 * Stores environment specific info, populated by the launcher.
 * This allows sane plugin development in a multi-browser, multi-driver environment.
 *
 * @class LauncherEnv
 * @extends {TypeGuards}
 */
class LauncherEnv extends TypeGuards {
    /** @private */
    constructor(driverName) {
        super();
        /**
         * The name of the driver currently in use: `"playwright" | "puppeteer"`.
         */
        this.driverName = 'unknown';
        /**
         * The name of the browser engine currently in use: `"chromium" | "firefox" | "webkit" | "unknown"`.
         *
         * Note: With puppeteer the browser will only be known once a browser object is available (after launching or connecting),
         * as they support defining the browser during `.launch()`.
         */
        this.browserName = 'unknown';
        if (driverName) {
            this.driverName = driverName;
        }
        this.events = new events_1.EventEmitter();
    }
    // Helper methods for convenience
    /** Check if current driver is puppeteer */
    get isPuppeteer() {
        return this.driverName === 'puppeteer';
    }
    /** Check if current driver is playwright */
    get isPlaywright() {
        return this.driverName === 'playwright';
    }
    /** Check if current browser is chrome or chromium */
    get isChromium() {
        return this.browserName === 'chromium';
    }
    /** Check if current browser is firefox */
    get isFirefox() {
        return this.browserName === 'firefox';
    }
    /** Check if current browser is webkit */
    get isWebkit() {
        return this.browserName === 'webkit';
    }
    /** Check if current browser is known */
    get isBrowserKnown() {
        return this.browserName !== 'unknown';
    }
}
exports.LauncherEnv = LauncherEnv;
/**
 * Cache per-page cdp sessions
 * @private
 */
const cdpSessionCache = new WeakMap();
/**
 * Unified Page methods for Playwright & Puppeteer.
 * They support common actions through a single API.
 *
 * @class PageShim
 */
class PageShim {
    constructor(env, page) {
        this.env = env;
        this.page = page;
        this.unsupportedShimError = new Error(`Unsupported shim: ${this.env.driverName}/${this.env.browserName}`);
    }
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
    async addScript(script, arg) {
        if (this.env.isPuppeteerPage(this.page)) {
            return this.page.evaluateOnNewDocument(script, arg);
        }
        if (this.env.isPlaywrightPage(this.page)) {
            return this.page.addInitScript(script, arg);
        }
        throw this.unsupportedShimError;
    }
    /**
     * Chromium browsers only: Return a fully typed CDP session.
     *
     * @see https://playwright.dev/docs/api/class-cdpsession/
     * @see https://pptr.dev/#?product=Puppeteer&version=v7.0.4&show=api-class-cdpsession
     */
    async getCDPSession() {
        if (this.env.isBrowserKnown && !this.env.isChromium) {
            throw new Error('CDP sessions are only available for chromium based browsers.');
        }
        const session = cdpSessionCache.get(this.page);
        if (session) {
            return session;
        }
        const createSession = () => {
            if (this.env.isPuppeteerPage(this.page)) {
                // In puppeteer we can re-use the existing connection,
                // I haven't found a way to do that in playwright yet
                return this.page._client;
                // return this.page.target().createCDPSession()
            }
            if (this.env.isPlaywrightPage(this.page)) {
                return this.page.context().newCDPSession(this.page);
            }
            throw this.unsupportedShimError;
        };
        const newSession = await createSession();
        cdpSessionCache.set(this.page, newSession);
        return newSession;
    }
}
exports.PageShim = PageShim;
//# sourceMappingURL=index.js.map