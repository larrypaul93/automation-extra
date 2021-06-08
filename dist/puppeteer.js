"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppeteerExtra = void 0;
const base_1 = require("./base");
class PuppeteerExtra extends base_1.AutomationExtraBase {
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
exports.PuppeteerExtra = PuppeteerExtra;
//# sourceMappingURL=puppeteer.js.map