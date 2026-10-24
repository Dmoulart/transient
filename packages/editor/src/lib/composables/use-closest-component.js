"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useClosestComponent = useClosestComponent;
var vue_1 = require("vue");
var use_id_1 = require("./use-id");
function useClosestComponent(node, template, dictionnary, index) {
    var id = (0, vue_1.computed)(function () { return node.value && index.closestComponentId(node.value); });
    return (0, use_id_1.useId)(id, template, dictionnary, index);
}
