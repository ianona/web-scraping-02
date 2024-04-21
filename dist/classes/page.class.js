"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = void 0;
class Page {
    constructor(page) {
        var _a, _b, _c;
        this.url = page.url;
        this.title = page.title;
        this.content = (_a = page.content) !== null && _a !== void 0 ? _a : null; // Using nullish coalescing operator to handle undefined and null
        this.status = (_b = page.status) !== null && _b !== void 0 ? _b : "finished"; // Default value "finished" if status is not provided
        this.error = (_c = page.error) !== null && _c !== void 0 ? _c : null; // Using nullish coalescing operator to handle undefined and null
    }
    update(newPage) {
        var _a, _b, _c;
        if (newPage.url)
            this.url = newPage.url;
        r: if (newPage.title !== undefined)
            this.title = newPage.title;
        if (newPage.content !== undefined)
            this.content = (_a = newPage.content) !== null && _a !== void 0 ? _a : null;
        if (newPage.status !== undefined)
            this.status = (_b = newPage.status) !== null && _b !== void 0 ? _b : "finished";
        if (newPage.error !== undefined)
            this.error = (_c = newPage.error) !== null && _c !== void 0 ? _c : null;
    }
}
exports.Page = Page;
