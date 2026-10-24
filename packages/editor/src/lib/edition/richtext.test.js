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
var bun_test_1 = require("bun:test");
var richtext_1 = require("./richtext");
// --- builders: the slot as it was before editing, and what ProseMirror hands back ---
var el = function (id, tag, children, attributes) {
    if (children === void 0) { children = []; }
    if (attributes === void 0) { attributes = {}; }
    return ({ id: id, tag: tag, isComponent: false, attributes: attributes, slots: { default: children } });
};
var text = function (id, value) { return ({
    id: id,
    tag: '#text',
    isComponent: false,
    attributes: { value: { type: 'literal', expression: value } },
}); };
var component = function (id, tag) { return ({
    id: id,
    tag: tag,
    isComponent: true,
    attributes: {},
}); };
// the container whose slot is being edited: ids are looked up in it
var container = function () {
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        children[_i] = arguments[_i];
    }
    return el('container', 'div', children);
};
var doc = function () {
    var content = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        content[_i] = arguments[_i];
    }
    return ({ type: 'doc', content: content });
};
// the element's attributes travel in the mark, as plain strings (see toPMInline)
var mark = function (id, tag, attributes) {
    if (attributes === void 0) { attributes = {}; }
    return ({
        type: 'inlineElement',
        attrs: { id: id, tag: tag, attributes: attributes },
    });
};
var t = function (value) {
    var marks = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        marks[_i - 1] = arguments[_i];
    }
    return marks.length ? { type: 'text', text: value, marks: marks } : { type: 'text', text: value };
};
var island = function (id) { return ({ type: 'island', attrs: { id: id } }); };
// text ids are regenerated on every capture: compare the shape, as markup with element ids.
// An id the original slot doesn't have prints as #new: a split element must not reuse its id
function html(elements, known) {
    return elements
        .map(function (element) {
        var _a, _b, _c;
        if (element.tag === '#text')
            return String((_a = element.attributes.value) === null || _a === void 0 ? void 0 : _a.expression);
        var id = known.has(element.id) ? element.id : 'new';
        if (element.isComponent)
            return "<".concat(element.tag, "#").concat(id, "/>");
        var attrs = Object.entries(element.attributes)
            .map(function (_a) {
            var name = _a[0], expression = _a[1].expression;
            return " ".concat(name, "=\"").concat(expression, "\"");
        })
            .join('');
        return "<".concat(element.tag, "#").concat(id).concat(attrs, ">").concat(html((_c = (_b = element.slots) === null || _b === void 0 ? void 0 : _b.default) !== null && _c !== void 0 ? _c : [], known), "</").concat(element.tag, ">");
    })
        .join('');
}
function ids(elements) {
    return elements.flatMap(function (element) { var _a, _b; return __spreadArray([element.id], ids((_b = (_a = element.slots) === null || _a === void 0 ? void 0 : _a.default) !== null && _b !== void 0 ? _b : []), true); });
}
var capture = function (pm, original) {
    return html((0, richtext_1.pmContentToTransientElements)(pm, original), new Set(ids([original])));
};
(0, bun_test_1.describe)('pmContentToTransientElements', function () {
    (0, bun_test_1.test)('plain text', function () {
        (0, bun_test_1.expect)(capture(doc(t('Hello')), container(text('t1', 'Hello')))).toBe('Hello');
    });
    (0, bun_test_1.test)('a mark becomes the element it came from, with its attributes', function () {
        var style = { style: { type: 'literal', expression: 'color: crimson' } };
        var original = container(el('s', 'strong', [text('t1', 'red')], style));
        var pm = doc(t('red', mark('s', 'strong', { style: 'color: crimson' })));
        (0, bun_test_1.expect)(capture(pm, original)).toBe('<strong#s style="color: crimson">red</strong>');
    });
    (0, bun_test_1.test)('neighbour texts sharing a mark end up in one element', function () {
        // <strong>Crimson <em>emphasis</em></strong>: the e2e regression
        var original = container(el('s', 'strong', [text('t1', 'Crimson '), el('e', 'em', [text('t2', 'emphasis')])]));
        var pm = doc(t('Crimson ', mark('s', 'strong')), t('emphasis', mark('s', 'strong'), mark('e', 'em')));
        (0, bun_test_1.expect)(capture(pm, original)).toBe('<strong#s>Crimson <em#e>emphasis</em></strong>');
    });
    (0, bun_test_1.test)('an inner element closes and the outer one goes on', function () {
        var original = container(el('s', 'strong', [text('t1', 'a'), el('e', 'em', [text('t2', 'b')]), text('t3', 'c')]));
        var pm = doc(t('a', mark('s', 'strong')), t('b', mark('s', 'strong'), mark('e', 'em')), t('c', mark('s', 'strong')));
        (0, bun_test_1.expect)(capture(pm, original)).toBe('<strong#s>a<em#e>b</em>c</strong>');
    });
    (0, bun_test_1.test)('identical neighbours stay two elements', function () {
        var original = container(el('a', 'span', [text('t1', 'twin')]), el('b', 'span', [text('t2', 'twin')]));
        var pm = doc(t('twin', mark('a', 'span')), t('twin', mark('b', 'span')));
        (0, bun_test_1.expect)(capture(pm, original)).toBe('<span#a>twin</span><span#b>twin</span>');
    });
    (0, bun_test_1.test)('text outside any mark sits between elements', function () {
        var original = container(el('s', 'strong', [text('t1', 'bold')]), text('t2', ' and '), el('e', 'em', [text('t3', 'italic')]));
        var pm = doc(t('bold', mark('s', 'strong')), t(' and '), t('italic', mark('e', 'em')));
        (0, bun_test_1.expect)(capture(pm, original)).toBe('<strong#s>bold</strong> and <em#e>italic</em>');
    });
    (0, bun_test_1.test)('an island is kept as the original component', function () {
        var original = container(text('t1', 'Count: '), component('c', 'Counter'), text('t2', '!'));
        var pm = doc(t('Count: '), island('c'), t('!'));
        (0, bun_test_1.expect)(capture(pm, original)).toBe('Count: <Counter#c/>!');
    });
    // the stack of open elements: a mark only continues the element open at the same depth
    (0, bun_test_1.test)('an element split in two by plain text gives two elements, in order', function () {
        // the user removed the bold in the middle of <strong>abc</strong>
        var original = container(el('s', 'strong', [text('t1', 'abc')]));
        var pm = doc(t('a', mark('s', 'strong')), t('b'), t('c', mark('s', 'strong')));
        (0, bun_test_1.expect)(capture(pm, original)).toBe('<strong#s>a</strong>b<strong#new>c</strong>');
    });
    (0, bun_test_1.test)('an inner mark outliving its outer one leaves the outer element', function () {
        var original = container(el('s', 'strong', [el('e', 'em', [text('t1', 'ab')])]));
        var pm = doc(t('a', mark('s', 'strong'), mark('e', 'em')), t('b', mark('e', 'em')));
        (0, bun_test_1.expect)(capture(pm, original)).toBe('<strong#s><em#e>a</em></strong><em#new>b</em>');
    });
    (0, bun_test_1.test)('an inner element closed by a sibling does not reopen', function () {
        var original = container(el('s', 'strong', [
            el('e', 'em', [text('t1', 'a')]),
            el('u', 'u', [text('t2', 'b')]),
            text('t3', 'c'),
        ]));
        // c is italic again after the underline: a new <em>, after the <u>
        var pm = doc(t('a', mark('s', 'strong'), mark('e', 'em')), t('b', mark('s', 'strong'), mark('u', 'u')), t('c', mark('s', 'strong'), mark('e', 'em')));
        (0, bun_test_1.expect)(capture(pm, original)).toBe('<strong#s><em#e>a</em><u#u>b</u><em#new>c</em></strong>');
    });
});
