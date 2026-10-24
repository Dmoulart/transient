"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEditor = useEditor;
var transient_1 = require("transient");
var vue_1 = require("vue");
var edition_1 = require("@/editor/edition");
var richtext_1 = require("../edition/richtext");
var use_element_1 = require("./use-element");
function useEditor(template, dictionnary) {
    var selection = (0, vue_1.ref)(null);
    var editing = (0, vue_1.ref)(null);
    // latest first, capped
    var history = (0, vue_1.shallowRef)([]);
    var ancestors = (0, vue_1.computed)(function () {
        var _a;
        if (((_a = selection.value) === null || _a === void 0 ? void 0 : _a.kind) === 'element') {
            return (0, transient_1.getAncestorsChain)(selection.value.id, template.value.elements);
        }
        return [];
    });
    var owner = (0, vue_1.computed)(function () {
        var _a, _b;
        return (_b = (_a = ancestors === null || ancestors === void 0 ? void 0 : ancestors.value) === null || _a === void 0 ? void 0 : _a.findLast(function (_a) {
            var element = _a.element;
            return element.isComponent;
        })) !== null && _b !== void 0 ? _b : null;
    });
    var selectedSlot = (0, vue_1.computed)(function () {
        var _a;
        if (((_a = selection.value) === null || _a === void 0 ? void 0 : _a.kind) === 'slot') {
            return { ownerId: selection.value.ownerId, slotName: selection.value.slotName };
        }
        return owner.value ? { ownerId: owner.value.element.id, slotName: owner.value.slotName } : null;
    });
    var selectedElement = (0, vue_1.computed)(function () {
        var _a, _b;
        if (((_a = selection.value) === null || _a === void 0 ? void 0 : _a.kind) === 'element') {
            return (_b = (0, transient_1.findElementById)(template.value.elements, selection.value.id)) !== null && _b !== void 0 ? _b : null;
        }
        return null;
    });
    var activeComponentId = (0, vue_1.computed)(function () {
        var _a, _b, _c;
        if (selection.value === null) {
            return null;
        }
        if (selection.value.kind === 'element') {
            var element = selectedElement.value;
            if (element === null || element === void 0 ? void 0 : element.isComponent) {
                return element.id;
            }
            return (_c = (_b = (_a = owner.value) === null || _a === void 0 ? void 0 : _a.element) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : null;
        }
        if (selection.value.kind === 'slot') {
            return selection.value.ownerId;
        }
        return null;
    });
    var activeComponent = (0, use_element_1.useElement)(activeComponentId, template, dictionnary);
    var editTarget = (0, vue_1.computed)(function () {
        var element = selectedElement.value;
        if (!element || element.isComponent)
            return null;
        var slot = selectedSlot.value;
        if (slot)
            return { id: slot.ownerId, slotName: slot.slotName };
        // layout containers (only blocks inside) are selected, not edited
        return hasText(element) ? { id: element.id } : null;
    });
    function pointOn(id, point, slotName, occurrence) {
        if (slotName) {
            select({ kind: 'slot', ownerId: id, slotName: slotName });
            startEditing(id, point, slotName, occurrence);
            return;
        }
        select({ kind: 'element', id: id });
        if (editTarget.value) {
            startEditing(editTarget.value.id, point, editTarget.value.slotName);
        }
    }
    function select(newSelection) {
        selection.value = newSelection;
        stopEditing();
    }
    function edit(edition) {
        (0, edition_1.applyEdition)(edition, template.value.elements);
        history.value = __spreadArray([edition], history.value, true).slice(0, 20);
    }
    function startEditing(id, point, slotName, occurrence) {
        editing.value = { id: id, point: point, slotName: slotName, occurrence: occurrence };
    }
    function stopEditing() {
        editing.value = null;
    }
    function hasText(element) {
        var _a, _b;
        return !!((_b = (_a = element.slots) === null || _a === void 0 ? void 0 : _a.default) === null || _b === void 0 ? void 0 : _b.some(function (child) {
            var _a, _b;
            return child.tag === '#text'
                ? !!String((_b = (_a = child.attributes.value) === null || _a === void 0 ? void 0 : _a.expression) !== null && _b !== void 0 ? _b : '').trim()
                : richtext_1.INLINE_TAGS.has(child.tag) && hasText(child);
        }));
    }
    return {
        select: select,
        selection: (0, vue_1.readonly)(selection),
        selectedElement: selectedElement,
        selectedSlot: selectedSlot,
        activeComponent: activeComponent,
        editing: (0, vue_1.readonly)(editing),
        history: (0, vue_1.readonly)(history),
        pointOn: pointOn,
        edit: edit,
        startEditing: startEditing,
        stopEditing: stopEditing,
    };
}
