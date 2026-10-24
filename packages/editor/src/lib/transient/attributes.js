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
exports.parseElementAttributes = parseElementAttributes;
function parseElementAttributes(element) {
    return __assign({}, Object.fromEntries(Object.entries(element.attributes || {}).map(function (_a) {
        var key = _a[0], value = _a[1];
        return [key, value.expression];
    })));
}
