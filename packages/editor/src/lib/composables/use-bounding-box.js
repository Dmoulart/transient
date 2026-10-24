"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useElementsBounding = useElementsBounding;
var core_1 = require("@vueuse/core");
var vue_1 = require("vue");
function unrefNode(node) {
    var value = (0, vue_1.toValue)(node);
    if (value && '$el' in value) {
        return value.$el;
    }
    return value;
}
function useElementsBounding(targets, options) {
    if (options === void 0) { options = {}; }
    var _a = options.reset, reset = _a === void 0 ? true : _a, _b = options.windowResize, windowResize = _b === void 0 ? true : _b, _c = options.windowScroll, windowScroll = _c === void 0 ? true : _c, _d = options.immediate, immediate = _d === void 0 ? true : _d, _e = options.updateTiming, updateTiming = _e === void 0 ? 'sync' : _e;
    var nodes = (0, vue_1.computed)(function () {
        if (!targets) {
            return [];
        }
        var derefElements = (0, vue_1.unref)(targets);
        var nodes = typeof derefElements === 'function' ? derefElements() : derefElements;
        var normalized = Array.isArray(nodes) ? nodes : [nodes];
        return normalized;
    });
    var targetElements = (0, vue_1.computed)(function () {
        return nodes.value.filter(function (node) { return node instanceof HTMLElement; });
    });
    var height = (0, vue_1.shallowRef)(0);
    var bottom = (0, vue_1.shallowRef)(0);
    var left = (0, vue_1.shallowRef)(0);
    var right = (0, vue_1.shallowRef)(0);
    var top = (0, vue_1.shallowRef)(0);
    var width = (0, vue_1.shallowRef)(0);
    var x = (0, vue_1.shallowRef)(0);
    var y = (0, vue_1.shallowRef)(0);
    function recalculate() {
        if (!nodes.value || nodes.value.length === 0) {
            if (reset) {
                height.value = 0;
                bottom.value = 0;
                left.value = 0;
                right.value = 0;
                top.value = 0;
                width.value = 0;
                x.value = 0;
                y.value = 0;
            }
            return;
        }
        var union = null;
        for (var _i = 0, _a = nodes.value; _i < _a.length; _i++) {
            var element = _a[_i];
            var node = unrefNode(element);
            if (!node) {
                continue;
            }
            var rect = null;
            if (node instanceof Element) {
                rect = node.getBoundingClientRect();
            }
            else if (node.nodeType === document.TEXT_NODE && node.textContent !== '') {
                var range = document.createRange();
                range.selectNodeContents(node);
                rect = range.getBoundingClientRect();
            }
            else {
                continue;
            }
            if (union) {
                union = mergeBbox(union, rect);
            }
            else {
                union = rect;
            }
        }
        if (!union) {
            return;
        }
        height.value = union.height;
        bottom.value = union.bottom;
        left.value = union.left;
        right.value = union.right;
        top.value = union.top;
        width.value = union.width;
        x.value = union.x;
        y.value = union.y;
    }
    function update() {
        if (updateTiming === 'sync')
            recalculate();
        else if (updateTiming === 'next-frame')
            requestAnimationFrame(function () { return recalculate(); });
    }
    (0, core_1.useResizeObserver)(targetElements, update);
    (0, vue_1.watch)(function () { return targets; }, function (ele) { return !ele && update(); });
    (0, core_1.useMutationObserver)(targetElements, update, {
        attributeFilter: ['style', 'class'],
    });
    if (windowScroll)
        (0, core_1.useEventListener)('scroll', update, { capture: true, passive: true });
    if (windowResize)
        (0, core_1.useEventListener)('resize', update, { passive: true });
    (0, core_1.tryOnMounted)(function () {
        if (immediate)
            update();
    });
    // perf crap, react to any edition instead.
    (0, core_1.useMutationObserver)(document.body, update, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
    });
    return {
        height: height,
        bottom: bottom,
        left: left,
        right: right,
        top: top,
        width: width,
        x: x,
        y: y,
        update: update,
    };
}
function mergeBbox(a, b) {
    var top = Math.min(a.top, b.top);
    var left = Math.min(a.left, b.left);
    var bottom = Math.max(a.bottom, b.bottom);
    var right = Math.max(a.right, b.right);
    return { top: top, left: left, bottom: bottom, right: right, x: left, y: top, width: right - left, height: bottom - top };
}
