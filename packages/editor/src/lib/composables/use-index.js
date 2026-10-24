"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIndex = useIndex;
var vue_1 = require("vue");
function useIndex() {
    var elements = (0, vue_1.reactive)(new Map());
    function first(vnode) {
        if (vnode.component) {
            return first(vnode.component.subTree);
        }
        return vnode.el;
    }
    function last(vnode) {
        if (vnode.component) {
            return last(vnode.component.subTree);
        }
        return (vnode.type === vue_1.Fragment ? vnode.anchor : vnode.el);
    }
    function between(start, end) {
        var nodes = [];
        var current = start;
        while (current) {
            nodes.push(current);
            if (current === end) {
                break;
            }
            current = current.nextSibling;
        }
        return nodes;
    }
    function range(vnode) {
        return between(first(vnode), last(vnode));
    }
    function vnode(id) {
        return elements.get(id);
    }
    function rootNodes(id) {
        var vnode = elements.get(id);
        return vnode ? range(vnode) : [];
    }
    function nodesToId() {
        var nodeToId = new Map();
        for (var _i = 0, _a = elements.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], id = _b[0], vnode_1 = _b[1];
            if (vnode_1.component) {
                for (var _c = 0, _d = range(vnode_1); _c < _d.length; _c++) {
                    var node = _d[_c];
                    nodeToId.set(node, id);
                }
            }
            else if (vnode_1.el) {
                nodeToId.set(vnode_1.el, id);
            }
        }
        return nodeToId;
    }
    function nodeId(node) {
        return nodesToId().get(node);
    }
    function closestAncestorId(node, match) {
        if (match === void 0) { match = function () { return true; }; }
        var ids = nodesToId();
        for (var n = node; n; n = n.parentNode) {
            var id = ids.get(n);
            if (id && match(id))
                return id;
        }
        return null;
    }
    function closestComponentId(node) {
        return closestAncestorId(node, function (id) { var _a; return !!((_a = elements.get(id)) === null || _a === void 0 ? void 0 : _a.component); });
    }
    function slots(ownerId) {
        var _a;
        var instance = (_a = elements.get(ownerId)) === null || _a === void 0 ? void 0 : _a.component;
        if (!instance)
            return [];
        var root = rootNodes(ownerId);
        var found = [];
        var walk = function (vnode) {
            if (isSlotFragment(vnode, instance)) {
                var key = vnode.key;
                var fallback = key.endsWith('_fb');
                var start = vnode.el;
                var end = vnode.anchor;
                // drop Fragment anchors (empty text nodes)
                var nodes = between(start, end).slice(1, -1);
                // see component builder, we need to clearly state the slot name in the key in the case of v-fored slots
                var slotName = key.slice(1, fallback ? -3 : undefined).split('__!__')[0];
                found.push({
                    name: slotName,
                    fallback: fallback,
                    nodes: nodes,
                    container: containerOf(start, root),
                });
            }
            if (vnode.component)
                walk(vnode.component.subTree);
            if (Array.isArray(vnode.children))
                vnode.children.forEach(walk);
        };
        walk(instance.subTree);
        return found;
    }
    // a slot can be rendered several times (v-for): `occurrence` picks the copy, in render order
    function slot(ownerId, slotName, occurrence) {
        if (occurrence === void 0) { occurrence = 0; }
        return slots(ownerId).filter(function (slot) { return slot.name === slotName; })[occurrence];
    }
    function slotAt(ownerId, node) {
        var _a;
        var found = slots(ownerId);
        var hit = (_a = found.find(function (slot) { return slot.nodes.some(function (n) { return n.contains(node); }); })) !== null && _a !== void 0 ? _a : found.find(function (slot) { return slot.container.some(function (c) { return c.contains(node); }); });
        if (!hit)
            return null;
        var occurrence = found.filter(function (slot) { return slot.name === hit.name; }).indexOf(hit);
        return { name: hit.name, occurrence: occurrence };
    }
    return {
        elements: elements,
        nodeId: nodeId,
        rootNodes: rootNodes,
        vnode: vnode,
        closestAncestorId: closestAncestorId,
        closestComponentId: closestComponentId,
        slots: slots,
        slot: slot,
        slotAt: slotAt,
    };
}
function isSlotFragment(vnode, owner) {
    return (vnode.type === vue_1.Fragment &&
        // ctx is @internal in Vue's types
        vnode.ctx === owner &&
        typeof vnode.key === 'string' &&
        vnode.key.startsWith('_'));
}
// The element holding the slot, if it belongs to the component; otherwise (slot at the
// component's root, e.g. a multi-root component) the component's root nodes.
function containerOf(anchor, root) {
    var parent = anchor.parentNode;
    var inside = parent && root.some(function (node) { return node !== parent && node.contains(parent); });
    return inside ? [parent] : root;
}
