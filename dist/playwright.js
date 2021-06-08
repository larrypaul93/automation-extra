"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaywrightExtra = void 0;
const base_1 = require("./base");
class PlaywrightExtra extends base_1.AutomationExtraBase {
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
exports.PlaywrightExtra = PlaywrightExtra;
//# sourceMappingURL=playwright.js.map