import type * as pptr from 'puppeteer';
declare module 'puppeteer' {
    interface Browser {
        _createPageInContext: (contextId?: string) => Promise<pptr.Page>;
    }
}
