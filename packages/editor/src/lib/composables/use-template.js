"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTemplate = useTemplate;
var vue_1 = require("vue");
var STORAGE_KEY = 'page-schema';
function useTemplate(template) {
    var contents = (0, vue_1.ref)(template);
    function saveToLocalStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contents.value));
        console.log('Sauvegardé dans le localStorage.');
    }
    function loadFromLocalStorage() {
        var savedContents = localStorage.getItem(STORAGE_KEY);
        if (savedContents) {
            contents.value = JSON.parse(savedContents);
            console.log('Chargé depuis le localStorage.', contents.value);
        }
        else {
            console.log('Aucun élément dans le localStorage.');
        }
    }
    return {
        contents: contents,
        saveToLocalStorage: saveToLocalStorage,
        loadFromLocalStorage: loadFromLocalStorage,
    };
}
