"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSelection = useSelection;
var vue_1 = require("vue");
var use_closest_component_1 = require("./use-closest-component");
var use_editable_text_1 = require("./use-editable-text");
var use_node_1 = require("./use-node");
function useSelection(selectedNode, template, dictionnary, index) {
    var mouse = (0, vue_1.ref)({ x: 0, y: 0 });
    var selected = (0, use_node_1.useNode)(selectedNode, template);
    var component = (0, use_closest_component_1.useClosestComponent)((0, vue_1.computed)(function () {
        return selected.node.value;
    }), template, dictionnary, index);
    var text = (0, use_editable_text_1.useEditableText)((0, vue_1.computed)(function () {
        return selected.node.value;
    }), component, template, dictionnary, index);
    return { mouse: mouse, selected: selected, component: component, text: text };
}
