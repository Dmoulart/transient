"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEditableText = useEditableText;
var vue_1 = require("vue");
var use_id_1 = require("./use-id");
function useEditableText(maybeNode, _component, template, dictionnary, index) {
    var nodeId = (0, vue_1.computed)(function () { var _a; return (_a = (maybeNode.value && index.nodeId(maybeNode.value))) !== null && _a !== void 0 ? _a : null; });
    var tid = (0, use_id_1.useId)(nodeId, template, dictionnary, index);
    var id = (0, vue_1.computed)(function () { return tid.id.value; });
    var editable = (0, vue_1.computed)(function () {
        var _a;
        return !((_a = tid.element.value) === null || _a === void 0 ? void 0 : _a.isComponent);
    });
    var container = (0, vue_1.computed)(function () {
        if (maybeNode.value && editable.value) {
            return maybeNode.value;
        }
        return null;
    });
    return {
        id: id,
        editable: editable,
        container: container,
    };
}
