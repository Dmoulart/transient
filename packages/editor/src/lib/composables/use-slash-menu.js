"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSlashMenu = useSlashMenu;
var vue_1 = require("vue");
var slashMenu = {
    open: (0, vue_1.ref)(false),
    rect: (0, vue_1.ref)(null),
};
function useSlashMenu() {
    return slashMenu;
}
