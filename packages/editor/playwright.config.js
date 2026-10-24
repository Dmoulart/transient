"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    testMatch: '**/*.e2e.ts',
    workers: 3,
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'retain-on-failure',
    },
    projects: [{ name: 'chromium', use: __assign({}, test_1.devices['Desktop Chrome']) }],
    webServer: {
        command: 'bun run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
    },
});
