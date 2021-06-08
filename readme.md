# automation-extra [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/berstend/puppeteer-extra/Test/master)](https://github.com/berstend/puppeteer-extra/actions) [![Discord](https://img.shields.io/discord/737009125862408274)](http://scraping-chat.cf) [![npm](https://img.shields.io/npm/v/automation-extra.svg)](https://www.npmjs.com/package/automation-extra)

> Driver agnostic plugin framework used by [playwright-extra] and [puppeteer-extra].

## Installation

```bash
yarn add automation-extra
```

<details>
 <summary>Changelog</summary>

- v4.1
  - Initial public release

</details>

## Context

- A rewrite of the `puppeteer-extra` plugin system to be driver agnostic and support both Puppeteer and Playwright.
- Not meant to be used directly by end-users but through `puppeteer-extra` and `playwright-extra`.
- Supports both legacy PuppeteerExtraPlugins as well as new [AutomationExtraPlugins](https://github.com/berstend/puppeteer-extra/tree/master/packages/automation-extra-plugin).

## API

<!--
    Documentation is auto-generated by a custom fork of documentation.js
    More info: https://github.com/berstend/documentation-markdown-themes/wiki#documentationjs-with-markdown-theme-support
    Update this documentation by updating the source code.
-->

#### Table of Contents

- [addExtraPlaywright(launcher)](#addextraplaywrightlauncher)
- [addExtraPuppeteer(launcher)](#addextrapuppeteerlauncher)

### [addExtraPlaywright(launcher)](https://github.com/berstend/puppeteer-extra/blob/7a9082f9837f2403099e2181d639aa0065c51ba9/packages/automation-extra/src/index.ts#L73-L75)

- `launcher` **PlaywrightBrowserLauncher** Playwright (or compatible) browser launcher

Returns: **PlaywrightExtra**

Augment the provided Playwright browser launcher with plugin functionality.

Example:

```javascript
import playwright from 'playwright'
const chromium = addExtra(playwright.chromium)
chromium.use(plugin)
```

---

### [addExtraPuppeteer(launcher)](https://github.com/berstend/puppeteer-extra/blob/7a9082f9837f2403099e2181d639aa0065c51ba9/packages/automation-extra/src/index.ts#L87-L89)

- `launcher` **PuppeteerBrowserLauncher** Puppeteer (or compatible) browser launcher

Returns: **PuppeteerExtra**

Augment the provided Puppeteer browser launcher with plugin functionality.

Example:

```javascript
import vanillaPuppeteer from 'puppeteer'
const puppeteer = addExtra(vanillaPuppeteer)
puppeteer.use(plugin)
```

---

## License

Copyright © 2018 - 2020, [berstend̡̲̫̹̠̖͚͓̔̄̓̐̄͛̀͘](https://github.com/berstend). Released under the MIT License.

<!--
  Reference links
-->

[playwright-extra]: https://github.com/berstend/puppeteer-extra/tree/master/packages/playwright-extra
[puppeteer-extra]: https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra
