import type { LauncherEnv } from 'automation-extra-plugin';
import type * as types from './types';
export declare class PluginList {
    private readonly env;
    private readonly _plugins;
    constructor(env: LauncherEnv);
    /**
     * Get a list of all registered plugins.
     *
     * @member {Array<types.Plugin>}
     */
    get list(): types.Plugin[];
    /**
     * Get the names of all registered plugins.
     *
     * @member {Array<string>}
     * @private
     */
    get names(): string[];
    /**
     * Add a new plugin to the list (after checking if it's well-formed).
     *
     * @param plugin
     * @private
     */
    add(plugin: any): void;
    /**
     * Dispatch plugin lifecycle events in a typesafe way.
     * Only Plugins that expose the supplied property will be called.
     *
     * Will not await results to dispatch events as fast as possible to all plugins.
     *
     * @param name - The lifecycle method name
     * @param args - Optional: Any arguments to be supplied to the plugin methods
     */
    dispatch<TName extends types.PluginMethodNames>(name: TName, ...args: Parameters<types.PluginMethodFn<TName>>): void;
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
    dispatchBlocking<TName extends types.PluginMethodNames>(name: TName, ...args: Parameters<types.PluginMethodFn<TName>>): Promise<ReturnType<types.PluginMethodFn<TName>>>;
    dispatchLegacy<TName extends types.LegacyPluginMethodNames>(name: TName, ...args: Parameters<types.LegacyPluginMethodFn<TName>>): void;
    /**
     * Filter plugins based on their `filter` stanza
     */
    get filteredPlugins(): types.Plugin[];
    /**
     * Order plugins that have expressed a special placement requirement.
     *
     * This is useful/necessary for e.g. plugins that depend on the data from other plugins.
     *
     * @private
     */
    order(): void;
    /**
     * Lightweight plugin requirement checking.
     *
     * The main intent is to notify the user when a plugin won't work as expected.
     *
     * @todo This could be improved, e.g. be evaluated by the plugin base class.
     *
     * @private
     */
    checkRequirements(launchContext: types.LaunchContext): void;
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
    getData(name?: string): any;
    /**
     * Lightweight plugin dependency management to require plugins and code mods on demand.
     *
     * This uses the `dependencies` stanza (a `Set` or `Map`) exposed by `automation-extra` plugins.
     *
     * @private
     */
    resolveDependencies(): void;
}
