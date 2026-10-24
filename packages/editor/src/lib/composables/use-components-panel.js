"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useComponentPanel = useComponentPanel;
var transient_1 = require("transient");
var vue_1 = require("vue");
function useComponentPanel() {
    var componentPanelIsOpen = (0, vue_1.ref)(false);
    var onSelect = (0, vue_1.ref)();
    return {
        isOpen: (0, vue_1.readonly)(componentPanelIsOpen),
        onSelect: onSelect,
        close: function () {
            componentPanelIsOpen.value = false;
        },
        toggle: function () {
            componentPanelIsOpen.value = !componentPanelIsOpen.value;
        },
        open: function (onSelectCb) {
            onSelect.value = onSelectCb;
            componentPanelIsOpen.value = true;
        },
        select: function (componentSchema) {
            (0, transient_1.assertDefined)(onSelect.value);
            onSelect.value(componentSchema);
        },
    };
}
