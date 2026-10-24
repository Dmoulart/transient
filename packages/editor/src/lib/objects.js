"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapObjectValues = mapObjectValues;
function mapObjectValues(object, map) {
    return Object.fromEntries(Object.entries(object).map(function (_a) {
        var key = _a[0], value = _a[1];
        return [key, map(value)];
    }));
}
