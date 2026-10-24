"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTextSelection = useTextSelection;
var core_1 = require("@vueuse/core");
var vue_1 = require("vue");
function useTextSelection() {
    var selection = (0, vue_1.ref)(null);
    var observer = null;
    function updateSelection() {
        var sel = window.getSelection();
        if (!sel) {
            selection.value = null;
            return;
        }
        // Disconnect previous observer
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        selection.value = sel;
        (0, vue_1.triggerRef)(selection);
        observer = new MutationObserver(function () {
            (0, vue_1.triggerRef)(selection);
        });
        observer.observe(document, {
            characterData: true,
            childList: true,
            subtree: true,
            attributes: true,
        });
    }
    (0, core_1.useEventListener)(document, 'selectionchange', updateSelection);
    return selection;
}
