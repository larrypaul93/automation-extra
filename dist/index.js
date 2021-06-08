"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExtraPuppeteer = exports.addExtraPlaywright = exports._addExtra = exports.AutomationExtraBase = exports.PuppeteerExtra = exports.PlaywrightExtra = void 0;
const playwright_1 = require("./playwright");
const puppeteer_1 = require("./puppeteer");
__exportStar(require("./types"), exports);
var playwright_2 = require("./playwright");
Object.defineProperty(exports, "PlaywrightExtra", { enumerable: true, get: function () { return playwright_2.PlaywrightExtra; } });
var puppeteer_2 = require("./puppeteer");
Object.defineProperty(exports, "PuppeteerExtra", { enumerable: true, get: function () { return puppeteer_2.PuppeteerExtra; } });
var base_1 = require("./base");
Object.defineProperty(exports, "AutomationExtraBase", { enumerable: true, get: function () { return base_1.AutomationExtraBase; } });
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
        return new playwright_1.PlaywrightExtra(launcher);
    }
    // Everything else we treat as Puppeteer or a custom puppeteer-like implementation
    return new puppeteer_1.PuppeteerExtra(launcher);
};
exports._addExtra = _addExtra;
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
const addExtraPlaywright = (launcher) => exports._addExtra(launcher);
exports.addExtraPlaywright = addExtraPlaywright;
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
const addExtraPuppeteer = (launcher) => exports._addExtra(launcher);
exports.addExtraPuppeteer = addExtraPuppeteer;
//# sourceMappingURL=index.js.map