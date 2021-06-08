/*!
 * automation-extra v4.2.0 by berstend
 * https://github.com/berstend/puppeteer-extra/tree/master/packages/automation-extra
 * @license MIT
 */
import { LauncherEnv } from 'automation-extra-plugin';
import Debug from 'debug';

const debug$1 = Debug('automation-extra:plugins');
class PluginList {
    constructor(env) {
        this.env = env;
        this._plugins = [];
    }
    /**
     * Get a list of all registered plugins.
     *
     * @member {Array<types.Plugin>}
     */
    get list() {
        return this._plugins;
    }
    /**
     * Get the names of all registered plugins.
     *
     * @member {Array<string>}
     * @private
     */
    get names() {
        return this._plugins.map(p => p.name);
    }
    /**
     * Add a new plugin to the list (after checking if it's well-formed).
     *
     * @param plugin
     * @private
     */
    add(plugin) {
        if (!plugin || !plugin.name) {
            throw new Error('A plugin must have a .name property');
        }
        const isPuppeteerExtraPlugin = plugin._isPuppeteerExtraPlugin === true;
        const isPlaywrightDriver = this.env.driverName === 'playwright';
        if (isPuppeteerExtraPlugin && isPlaywrightDriver) {
            console.warn(`Warning: Plugin "${plugin.name || 'unknown'}" is derived from PuppeteerExtraPlugin and will most likely not work with playwright.`);
        }
        // Give the plugin access to the env info
        plugin.env = this.env;
        if ('onPluginRegistered' in plugin) {
            plugin.onPluginRegistered();
            this.env.events.emit('onPluginRegistered');
        }
        if (plugin.requirements.has('dataFromPlugins')) {
            plugin.getDataFromPlugins = this.getData.bind(this);
        }
        this._plugins.push(plugin);
    }
    /**
     * Dispatch plugin lifecycle events in a typesafe way.
     * Only Plugins that expose the supplied property will be called.
     *
     * Will not await results to dispatch events as fast as possible to all plugins.
     *
     * @param name - The lifecycle method name
     * @param args - Optional: Any arguments to be supplied to the plugin methods
     */
    dispatch(name, ...args) {
        const filteredPlugins = this.filteredPlugins;
        const plugins = filteredPlugins.filter(plugin => name in plugin);
        debug$1('dispatch', {
            name,
            currentEnv: `${this.env.driverName}:${this.env.browserName}`,
            plugins: {
                all: this._plugins.length,
                filtered: filteredPlugins.length,
                filteredWithEvent: plugins.length
            }
        });
        for (const plugin of plugins) {
            try {
                ;
                plugin[name](...args);
            }
            catch (err) {
                console.warn(`An error occured while executing ${name} in plugin "${plugin.name}":`, err);
            }
        }
        this.env.events.emit(name, ...args);
    }
    /**
     * Dispatch plugin lifecycle events in a typesafe way.
     * Only Plugins that expose the supplied property will be called.
     *
     * Can also be used to get a definite return value after passing it to plugins:
     * Calls plugins sequentially and passes on a value (waterfall style).
     *
     * The plugins can either modify the value or return an updated one.
     * Will return the latest, updated value which ran through all plugins.
     *
     * By convention only the first argument will be used as the updated value.
     *
     * @param name - The lifecycle method name
     * @param args - Optional: Any arguments to be supplied to the plugin methods
     */
    async dispatchBlocking(name, ...args) {
        const filteredPlugins = this.filteredPlugins;
        const plugins = filteredPlugins.filter(plugin => name in plugin);
        debug$1('dispatchBlocking', {
            name,
            currentEnv: `${this.env.driverName}:${this.env.browserName}`,
            plugins: {
                all: this._plugins.length,
                filtered: filteredPlugins.length,
                filteredWithEvent: plugins.length
            }
        });
        let retValue = null;
        for (const plugin of plugins) {
            try {
                retValue = await plugin[name](...args);
                // In case we got a return value use that as new first argument for followup function calls
                if (retValue !== undefined) {
                    args[0] = retValue;
                }
            }
            catch (err) {
                console.warn(`An error occured while executing ${name} in plugin "${plugin.name}":`, err);
                return retValue;
            }
        }
        this.env.events.emit(name, ...args);
        return retValue;
    }
    dispatchLegacy(name, ...args) {
        const filteredPlugins = this.filteredPlugins;
        const plugins = filteredPlugins.filter(plugin => name in plugin);
        debug$1('dispatch', {
            name,
            currentEnv: `${this.env.driverName}:${this.env.browserName}`,
            plugins: {
                all: this._plugins.length,
                filtered: filteredPlugins.length,
                filteredWithEvent: plugins.length
            }
        });
        for (const plugin of plugins) {
            try {
                ;
                plugin[name](...args);
                // In case we got a return value use that as new first argument for followup function calls
            }
            catch (err) {
                console.warn(`An error occured while executing ${name} in plugin "${plugin.name}":`, err);
            }
        }
    }
    /**
     * Filter plugins based on their `filter` stanza
     */
    get filteredPlugins() {
        const currentEnv = `${this.env.driverName}:${this.env.browserName}`;
        const plugins = this._plugins.filter(plugin => {
            var _a, _b, _c, _d;
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if ((_b = (_a = plugin.filter) === null || _a === void 0 ? void 0 : _a.include) === null || _b === void 0 ? void 0 : _b.length) {
                return plugin.filter.include.includes(currentEnv);
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            }
            else if ((_d = (_c = plugin.filter) === null || _c === void 0 ? void 0 : _c.exclude) === null || _d === void 0 ? void 0 : _d.length) {
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return !plugin.filter.exclude.includes(currentEnv);
            }
            return true; // keep plugin
        });
        return plugins;
    }
    /**
     * Order plugins that have expressed a special placement requirement.
     *
     * This is useful/necessary for e.g. plugins that depend on the data from other plugins.
     *
     * @private
     */
    order() {
        debug$1('order:before', this.names);
        const runLast = this._plugins
            .filter(p => p.requirements.has('runLast'))
            .map(p => p.name);
        for (const name of runLast) {
            const index = this._plugins.findIndex(p => p.name === name);
            this._plugins.push(this._plugins.splice(index, 1)[0]);
        }
        debug$1('order:after', this.names);
    }
    /**
     * Lightweight plugin requirement checking.
     *
     * The main intent is to notify the user when a plugin won't work as expected.
     *
     * @todo This could be improved, e.g. be evaluated by the plugin base class.
     *
     * @private
     */
    checkRequirements(launchContext) {
        for (const plugin of this._plugins) {
            for (const requirement of plugin.requirements) {
                if (launchContext.context === 'launch' &&
                    requirement === 'headful' &&
                    launchContext.isHeadless) {
                    debug$1(`Warning: Plugin '${plugin.name}' is not supported in headless mode.`);
                }
                if (launchContext.context === 'connect' && requirement === 'launch') {
                    debug$1(`Warning: Plugin '${plugin.name}' doesn't support connect().`);
                }
            }
        }
    }
    /**
     * Collects the exposed `data` property of all registered plugins.
     * Will be reduced/flattened to a single array.
     *
     * Can be accessed by plugins that listed the `dataFromPlugins` requirement.
     *
     * Implemented mainly for plugins that need data from other plugins (e.g. `user-preferences`).
     *
     * @see [PuppeteerExtraPlugin]/data
     * @param name - Filter data by optional name
     *
     * @private
     */
    getData(name) {
        const data = this._plugins
            .filter((p) => !!p.data)
            .map((p) => (Array.isArray(p.data) ? p.data : [p.data]))
            .reduce((acc, arr) => [...acc, ...arr], []);
        return name ? data.filter((d) => d.name === name) : data;
    }
    /**
     * Lightweight plugin dependency management to require plugins and code mods on demand.
     *
     * This uses the `dependencies` stanza (a `Set` or `Map`) exposed by `automation-extra` plugins.
     *
     * @private
     */
    resolveDependencies() {
        var _a;
        debug$1('resolveDependencies');
        const pluginNames = new Set(this._plugins.map((p) => p.name));
        // Handle `plugins` stanza
        this._plugins
            .filter(p => 'plugins' in p && p.plugins.length)
            .map(p => p)
            .forEach(parent => {
            parent.plugins
                .filter(p => !pluginNames.has(p.name))
                .forEach(p => {
                debug$1('adding missing plugin', p.name);
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (parent.filter && !p.filter) {
                    // Make child plugins inherit the parents filter if they don't have anything specified
                    Object.defineProperty(p, 'filter', {
                        get() {
                            return parent.filter;
                        }
                    });
                }
                this.add(p);
            });
        });
        // Handle `dependencies` stanza
        const allDeps = new Map();
        this._plugins
            // Skip plugins without dependencies
            .filter(p => 'dependencies' in p && p.dependencies.size)
            .map(p => p.dependencies)
            .forEach(deps => {
            if (deps instanceof Set) {
                deps.forEach(k => allDeps.set(k, {}));
            }
            if (deps instanceof Map) {
                deps.forEach((v, k) => {
                    allDeps.set(k, v); // Note: k,v => v,k
                });
            }
        });
        const missingDeps = new Map([...allDeps].filter(([k]) => !pluginNames.has(k)));
        if (!missingDeps.size) {
            debug$1('no dependencies are missing');
            return;
        }
        debug$1('dependencies missing', missingDeps);
        // Loop through all dependencies declared missing by plugins
        for (const [name, opts] of [...missingDeps]) {
            // Check if the dependency hasn't been registered as plugin already.
            // This might happen when multiple plugins have nested dependencies.
            if (this.names.includes(name)) {
                debug$1(`ignoring dependency '${name}', which has been required already.`);
                continue;
            }
            const hasFullName = name.startsWith('puppeteer-extra-plugin') ||
                name.startsWith('automation-extra-plugin');
            // We follow a plugin naming convention, but let's rather enforce it <3
            const requireNames = hasFullName
                ? [name]
                : [`automation-extra-plugin-${name}`, `puppeteer-extra-plugin-${name}`];
            const pkg = requirePackages$1(requireNames);
            if (!pkg) {
                throw new Error(`
          A plugin listed '${name}' as dependency,
          which is currently missing. Please install it:

${requireNames
                    .map(name => {
                    return `yarn add ${name.split('/')[0]}`;
                })
                    .join(`\n or:\n`)}

          Note: You don't need to require the plugin yourself,
          unless you want to modify it's default settings.
          `);
            }
            const plugin = pkg(opts);
            this.add(plugin);
            // Handle nested dependencies :D
            if ((_a = plugin.dependencies) === null || _a === void 0 ? void 0 : _a.size) {
                this.resolveDependencies();
            }
        }
    }
}
function requirePackages$1(packages) {
    for (const name of packages) {
        try {
            return require(name);
        }
        catch (_) {
            continue; // noop
        }
    }
    return false;
}

const debug = Debug('automation-extra');
class AutomationExtraBase {
    constructor(driverName, _launcher) {
        this._launcher = _launcher;
        this.env = new LauncherEnv(driverName);
        this.plugins = new PluginList(this.env);
    }
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
    use(plugin) {
        const isValid = plugin && 'name' in plugin;
        if (!isValid) {
            throw new Error('A plugin must be provided to .use()');
        }
        this.plugins.add(plugin);
        debug('Plugin registered', plugin.name); /* tslint:disable-line */
        return this;
    }
    /**
     * In order to support a default export which will require vanilla puppeteer or playwright automatically,
     * as well as named exports to patch the provided launcher, we need to so some gymnastics here unfortunately.
     *
     * If we just do e.g. `require('puppeteer')` in our default export this would throw immediately,
     * even when only using the `addExtra` export in combination with `puppeteer-core`. :-/
     *
     * The solution is to make the vanilla launcher optional and only throw once we try to effectively use and can't find it.
     */
    get launcher() {
        if (!this._launcher) {
            this._launcher = this._requireLauncherOrThrow();
            // In case we're dealing with Playwright we need to add the product name to the import
            if (this.env.isPlaywright) {
                this._launcher = this._launcher[this.env.browserName];
            }
        }
        return this._launcher;
    }
    /** @internal */
    async _connect(options = {}) {
        return await this._launchOrConnect('connect', options);
    }
    /** @internal */
    async _launch(options = {}) {
        return await this._launchOrConnect('launch', options);
    }
    /** @internal */
    async _launchOrConnect(method, options = {}) {
        debug(method);
        this.plugins.order();
        this.plugins.resolveDependencies();
        const beforeEvent = method === 'launch' ? 'beforeLaunch' : 'beforeConnect';
        const afterEvent = method === 'launch' ? 'afterLaunch' : 'afterConnect';
        // Only now we know the final browser with puppeteer
        if (this.env.isPuppeteer) {
            this.env.browserName = getPuppeteerProduct(options);
        }
        // Make it possible for plugins to use `options.args` without checking
        if (!isConnectOptions(options)) {
            if (typeof options.args === 'undefined') {
                options.args = [];
            }
        }
        // Give plugins the chance to modify the options before launch/connect
        options =
            (await this.plugins.dispatchBlocking(beforeEvent, options)) || options;
        // One of the plugins might have changed the browser product
        if (this.env.isPuppeteer) {
            this.env.browserName = getPuppeteerProduct(options);
        }
        const isHeadless = (() => {
            if (isConnectOptions(options)) {
                return false; // we don't know :-)
            }
            if ('headless' in options) {
                return options.headless === true;
            }
            return true; // default
        })();
        const launchContext = {
            context: method,
            isHeadless,
            options
        };
        // Let's check requirements after plugin had the chance to modify the options
        this.plugins.checkRequirements(launchContext);
        const browser = await this.launcher[method](options);
        if (this.env.isPuppeteerBrowser(browser)) {
            this._patchPageCreationMethods(browser);
        }
        await this.plugins.dispatchBlocking('onBrowser', browser, launchContext);
        if (this.env.isPuppeteerBrowser(browser)) {
            await this._bindPuppeteerBrowserEvents(browser);
        }
        else {
            await this._bindPlaywrightBrowserEvents(browser);
        }
        await this.plugins.dispatchBlocking(afterEvent, browser, launchContext);
        return browser;
    }
    async _bindPuppeteerBrowserEvents(browser) {
        debug('_bindPuppeteerBrowserEvents');
        browser.on('disconnected', () => {
            this.plugins.dispatch('onDisconnected', browser);
            this.plugins.dispatchLegacy('onClose');
        });
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        browser.on('targetcreated', async (target) => {
            debug('targetcreated');
            this.plugins.dispatchLegacy('onTargetCreated', target);
            // Pre filter pages for plugin developers convenience
            if (target.type() === 'page') {
                const page = await target.page();
                page.on('close', () => {
                    this.plugins.dispatch('onPageClose', page);
                });
                page.on('workercreated', worker => {
                    // handle dedicated webworkers
                    this.plugins.dispatch('onWorkerCreated', worker);
                });
                this.plugins.dispatch('onPageCreated', page);
            }
            if (target.type() === 'service_worker' ||
                target.type() === 'shared_worker') {
                // handle service + shared workers
                const worker = await target.worker();
                if (worker) {
                    this.plugins.dispatch('onWorkerCreated', worker);
                }
            }
        });
        // // Legacy events
        browser.on('targetchanged', (target) => {
            this.plugins.dispatchLegacy('onTargetChanged', target);
        });
        browser.on('targetdestroyed', (target) => {
            this.plugins.dispatchLegacy('onTargetDestroyed', target);
        });
    }
    async _bindPlaywrightBrowserEvents(browser) {
        debug('_bindPlaywrightBrowserEvents');
        browser.on('disconnected', () => {
            this.plugins.dispatch('onDisconnected', browser);
        });
        const bindContextEvents = (context) => {
            // Make sure things like `addInitScript` show an effect on the very first page as well
            context.newPage = ((originalMethod, ctx) => {
                return async () => {
                    const page = await originalMethod.call(ctx);
                    await page.goto('about:blank');
                    return page;
                };
            })(context.newPage, context);
            context.on('close', () => {
                this.plugins.dispatch('onContextClose', context);
            });
            context.on('page', page => {
                this.plugins.dispatch('onPageCreated', page);
                page.on('close', () => {
                    this.plugins.dispatch('onPageClose', page);
                });
                page.on('worker', worker => {
                    // handle dedicated webworkers
                    this.plugins.dispatch('onWorkerCreated', worker);
                });
                if (this.env.isChromium) {
                    context.on('serviceworker', worker => {
                        // handle service worker
                        this.plugins.dispatch('onWorkerCreated', worker);
                    });
                }
            });
        };
        // Note: `browser.newPage` will implicitly call `browser.newContext` as well
        browser.newContext = ((originalMethod, ctx) => {
            return async (options = {}) => {
                const contextOptions = (await this.plugins.dispatchBlocking('beforeContext', options || {}, browser)) || options;
                const context = await originalMethod.call(ctx, contextOptions);
                this.plugins.dispatch('onContextCreated', context, contextOptions);
                bindContextEvents(context);
                return context;
            };
        })(browser.newContext, browser);
    }
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
    _patchPageCreationMethods(browser) {
        if (!browser || !browser._createPageInContext) {
            return;
        }
        browser._createPageInContext = (function (originalMethod, context) {
            return async function () {
                const page = await originalMethod.apply(context, arguments);
                await page.goto('about:blank');
                return page;
            };
        })(browser._createPageInContext, browser);
    }
    _requireLauncherOrThrow() {
        const driverName = this.env.driverName;
        const packages = [driverName + '-core', driverName];
        const launcher = requirePackages(packages);
        if (launcher) {
            return launcher;
        }
        const driverNamePretty = driverName.charAt(0).toUpperCase() + driverName.slice(1);
        throw new Error(`

  ${driverNamePretty} is missing. :-)

  I tried requiring ${packages.join(', ')} - no luck.

  Make sure you install one of those packages or use the named 'addExtra' export,
  to patch a specific (and maybe non-standard) implementation of ${driverNamePretty}.

  To get the latest stable version of ${driverNamePretty} run:
  'yarn add ${driverName}' or 'npm i ${driverName}'
  `);
    }
}
function requirePackages(packages) {
    for (const name of packages) {
        try {
            return require(name);
        }
        catch (_) {
            continue; // noop
        }
    }
    return false;
}
/** Type guard: check if current options are connect options */
function isConnectOptions(options) {
    const yup = 'browserURL' in options ||
        'browserWSEndpoint' in options ||
        'wsEndpoint' in options;
    return yup;
}
function getPuppeteerProduct(options) {
    var _a;
    // Puppeteer supports defining the browser during launch or through an environment variable
    const override = (_a = process.env.PUPPETEER_PRODUCT) !== null && _a !== void 0 ? _a : (options || {}).product;
    return override === 'firefox' ? 'firefox' : 'chromium';
}

class PlaywrightExtra extends AutomationExtraBase {
    constructor(_launcherOrBrowserName) {
        if (typeof _launcherOrBrowserName === 'string') {
            super('playwright');
            this.env.browserName = _launcherOrBrowserName;
        }
        else {
            super('playwright', _launcherOrBrowserName);
            this.env.browserName = _launcherOrBrowserName.name();
        }
        this.vanillaLauncher = this.launcher;
    }
    // Stuff we augment for plugin purposes
    async connect(options) {
        const result = await this._connect(options);
        return result;
    }
    async launch(options) {
        const result = await this._launch(options);
        return result;
    }
    async connectOverCDP(params) {
        return {};
    }
    // FIXME: Augment this
    async launchPersistentContext(userDataDir, options // Not exported
    ) {
        console.warn('Note: launchPersistentContext does not trigger plugins currently.');
        return await this.vanillaLauncher.launchPersistentContext(userDataDir, options);
    }
    async launchServer(options // Not exported
    ) {
        return await this.vanillaLauncher.launchServer(options);
    }
    // Playwright specific things we just pipe through
    executablePath() {
        return this.vanillaLauncher.executablePath();
    }
    name() {
        return this.vanillaLauncher.name();
    }
}

class PuppeteerExtra extends AutomationExtraBase {
    constructor(_launcher) {
        super('puppeteer', _launcher);
        this.vanillaLauncher = this
            .launcher;
        // Puppeteer supports defining the browser during `.launch`
        this.env.browserName = 'unknown';
    }
    // Stuff we augment for plugin purposes
    async connect(options) {
        const result = await this._connect(options);
        return result;
    }
    async launch(options) {
        const result = await this._launch(options);
        return result;
    }
    // Puppeteer specific things we just pipe through
    defaultArgs(options) {
        return this.vanillaLauncher.defaultArgs(options);
    }
    executablePath() {
        return this.vanillaLauncher.executablePath();
    }
    createBrowserFetcher(options) {
        return this.vanillaLauncher.createBrowserFetcher(options);
    }
}

/**
 * Augment a Puppeteer or Playwright API compatible browser launcher with plugin functionality.
 * Note: We can't use `addExtra` here as we wildcard export this file in `playwright-extra` and `puppeteer-extra`
 *
 * @param launcher - Puppeteer or Playwright API compatible browser launcher
 * @private
 */
const _addExtra = (launcher) => {
    // General checks
    if (!launcher || typeof launcher !== 'object') {
        throw new Error('Invalid browser launcher: Expected object.');
    }
    if (!('launch' in launcher || 'connect' in launcher)) {
        throw new Error('Invalid browser launcher: Must provide "launch" or "connect" method.');
    }
    // Check for Playwright
    if ('name' in launcher) {
        const validBrowserNames = [
            'chromium',
            'firefox',
            'webkit'
        ];
        const hasValidBrowserName = validBrowserNames.includes(launcher.name());
        if (!hasValidBrowserName) {
            throw new Error(`Invalid Playwright launcher: Unexpected browser name "${launcher.name()}".`);
        }
        return new PlaywrightExtra(launcher);
    }
    // Everything else we treat as Puppeteer or a custom puppeteer-like implementation
    return new PuppeteerExtra(launcher);
};
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
const addExtraPlaywright = (launcher) => _addExtra(launcher);
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
const addExtraPuppeteer = (launcher) => _addExtra(launcher);

export { AutomationExtraBase, PlaywrightExtra, PuppeteerExtra, _addExtra, addExtraPlaywright, addExtraPuppeteer };
//# sourceMappingURL=index.esm.js.map
