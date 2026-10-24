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
exports.INLINE_TAGS = void 0;
exports.transientElementsToPmContent = transientElementsToPmContent;
exports.transientElementsToPMInlineContent = transientElementsToPMInlineContent;
exports.pmContentToTransientElements = pmContentToTransientElements;
var transient_1 = require("transient");
var objects_1 = require("../objects");
var attributes_1 = require("../transient/attributes");
function transientElementsToPmContent(content, placeholders) {
    return { type: "doc", content: transientElementsToPMInlineContent(content, placeholders) };
}
// rich text formatting: part of the text, never selected on its own
exports.INLINE_TAGS = new Set([
    "b",
    "strong",
    "i",
    "em",
    "u",
    "a",
    "span",
    "mark",
    "code",
    "s",
]);
function transientElementsToPMInlineContent(content, placeholders, marks) {
    if (marks === void 0) { marks = []; }
    return content.flatMap(function (element) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (placeholders.has(element.id)) {
            return [{ type: "island", attrs: { id: element.id } }];
        }
        if (element.tag === "#text") {
            var text = String((_c = (_b = (_a = element.attributes) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.expression) !== null && _c !== void 0 ? _c : "");
            // ProseMirror rejects empty text nodes
            return text ? [{ type: "text", text: text, marks: marks }] : [];
        }
        if (exports.INLINE_TAGS.has(element.tag)) {
            var attributes = (0, attributes_1.parseElementAttributes)(element);
            return transientElementsToPMInlineContent((_e = (_d = element.slots) === null || _d === void 0 ? void 0 : _d.default) !== null && _e !== void 0 ? _e : [], placeholders, __spreadArray(__spreadArray([], marks, true), [
                { type: "inlineElement", attrs: { id: element.id, tag: element.tag, attributes: attributes } },
            ], false));
        }
        return transientElementsToPMInlineContent((_g = (_f = element.slots) === null || _f === void 0 ? void 0 : _f.default) !== null && _g !== void 0 ? _g : [], placeholders);
    });
}
function pmContentToTransientElements(root, originalElement) {
    var _a;
    var byId = new Map();
    var index = function (elements) {
        var _a;
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            byId.set(element.id, element);
            Object.values((_a = element.slots) !== null && _a !== void 0 ? _a : {}).forEach(index);
        }
    };
    Object.values((_a = originalElement.slots) !== null && _a !== void 0 ? _a : {}).forEach(index);
    return pmContentToTransientElementsInner(root, byId);
}
function pmContentToTransientElementsInner(root, byId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var usedMarksIds = new Set();
    var children = [];
    var stack = [];
    var depth = 0;
    for (var _i = 0, _l = (_a = root.content) !== null && _a !== void 0 ? _a : [root]; _i < _l.length; _i++) {
        var node = _l[_i];
        var id = (_b = node.attrs) === null || _b === void 0 ? void 0 : _b.id;
        var original = id ? byId.get(id) : undefined;
        var wrapper = children;
        stack.length = (_d = (_c = node === null || node === void 0 ? void 0 : node.marks) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0;
        if (node.marks) {
            for (var _m = 0, _o = node.marks.entries(); _m < _o.length; _m++) {
                var _p = _o[_m], i = _p[0], mark = _p[1];
                (0, transient_1.assertDefined)(mark.attrs);
                (0, transient_1.assertIs)(transient_1.someString, mark.attrs.tag);
                var id_1 = (_e = mark === null || mark === void 0 ? void 0 : mark.attrs) === null || _e === void 0 ? void 0 : _e.id;
                var sameLevelPreviousMark = stack[i];
                if (!sameLevelPreviousMark || sameLevelPreviousMark.id !== id_1) {
                    var element_1 = {
                        id: id_1 && !usedMarksIds.has(id_1) ? id_1 : crypto.randomUUID(),
                        tag: mark.attrs.tag,
                        isComponent: false,
                        attributes: (0, objects_1.mapObjectValues)((_g = (_f = mark.attrs) === null || _f === void 0 ? void 0 : _f.attributes) !== null && _g !== void 0 ? _g : {}, function (value) { return ({
                            type: "literal",
                            expression: value,
                        }); }),
                        slots: { default: [] },
                    };
                    usedMarksIds.add(element_1.id);
                    stack.length = i;
                    depth = stack.push(element_1);
                    wrapper.push(element_1);
                }
                else {
                    depth = i + 1;
                }
                wrapper = depth > 0 ? stack[depth - 1].slots.default : children;
            }
        }
        var element = void 0;
        // islands are opaque: keep the component as it was
        if (original === null || original === void 0 ? void 0 : original.isComponent) {
            element = original;
        }
        else if (node.type === "text") {
            element = {
                id: id !== null && id !== void 0 ? id : crypto.randomUUID(),
                tag: "#text",
                isComponent: false,
                attributes: { value: { type: "literal", expression: (_h = node === null || node === void 0 ? void 0 : node.text) !== null && _h !== void 0 ? _h : "" } },
            };
        }
        else if (node.type === "inlineElement") {
            (0, transient_1.assertDefined)(node.attrs);
            element = {
                id: id !== null && id !== void 0 ? id : crypto.randomUUID(),
                tag: node.attrs.tag,
                isComponent: false,
                attributes: (0, objects_1.mapObjectValues)((_k = (_j = node.attrs) === null || _j === void 0 ? void 0 : _j.attributes) !== null && _k !== void 0 ? _k : {}, function (value) { return ({
                    type: "literal",
                    expression: value,
                }); }),
                slots: { default: [] },
            };
        }
        else if (node.type === "doc") {
            continue;
        }
        else {
            throw new Error("Unexpected node type ".concat(node.type));
        }
        wrapper.push(element);
    }
    return children;
}
