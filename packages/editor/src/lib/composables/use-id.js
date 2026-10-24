"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useId = useId;
var transient_1 = require("transient");
var vue_1 = require("vue");
function useId(id, template, dictionnary, index) {
    var element = (0, vue_1.computed)(function () {
        if (!id.value) {
            return null;
        }
        return (0, transient_1.findElementById)(template.value.elements, id.value);
    });
    var schema = (0, vue_1.computed)(function () {
        var _a;
        if ((_a = element.value) === null || _a === void 0 ? void 0 : _a.isComponent) {
            (0, transient_1.assertDefined)(element.value.tag);
            return dictionnary.get(element.value.tag);
        }
        return null;
    });
    var props = (0, vue_1.computed)(function () {
        if (!schema.value || !element.value) {
            return null;
        }
        return (0, transient_1.getElementProps)(schema.value, element.value);
    });
    var root = (0, vue_1.computed)(function () {
        var _a;
        if ((_a = element.value) === null || _a === void 0 ? void 0 : _a.isComponent) {
            return index.rootNodes(id.value);
        }
        return null;
    });
    var slots = (0, vue_1.computed)(function () {
        var _a;
        if ((_a = element.value) === null || _a === void 0 ? void 0 : _a.isComponent) {
            var slots_1 = index.slots(id.value);
            return slots_1.length > 0 ? slots_1 : null;
        }
        return null;
    });
    return { id: id, tag: id, element: element, schema: schema, props: props, root: root, slots: slots };
}
