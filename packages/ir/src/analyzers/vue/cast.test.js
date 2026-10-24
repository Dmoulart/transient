"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bun_test_1 = require("bun:test");
var cast_1 = require("./cast");
(0, bun_test_1.describe)("enum types normalization", function () {
    (0, bun_test_1.test)("boolean", function () {
        var type = (0, cast_1.castEnumType)(["true", "false"]).type;
        (0, bun_test_1.expect)(type).toEqual("boolean");
    });
    (0, bun_test_1.test)("optional with undefined", function () {
        var _a = (0, cast_1.castEnumType)(["undefined", "true", "false"]), type = _a.type, propInfos = _a.propInfos;
        (0, bun_test_1.expect)(propInfos.required).toEqual(false);
        (0, bun_test_1.expect)(type).toEqual("boolean");
    });
    (0, bun_test_1.test)("optional with null", function () {
        var _a = (0, cast_1.castEnumType)(["null", "true", "false"]), type = _a.type, propInfos = _a.propInfos;
        (0, bun_test_1.expect)(propInfos.required).toEqual(false);
        (0, bun_test_1.expect)(type).toEqual("boolean");
    });
    (0, bun_test_1.test)("optional with both null and undefined", function () {
        var _a = (0, cast_1.castEnumType)([
            "null",
            "undefined",
            "true",
            "false",
        ]), type = _a.type, propInfos = _a.propInfos;
        (0, bun_test_1.expect)(propInfos.required).toEqual(false);
        (0, bun_test_1.expect)(type).toEqual("boolean");
    });
    (0, bun_test_1.test)("string literals", function () {
        var _a = (0, cast_1.castEnumType)(['"One"', '"Two"', '"Three"']), type = _a.type, propInfos = _a.propInfos;
        (0, bun_test_1.expect)(propInfos.required).toEqual(true);
        (0, bun_test_1.expect)(type).toEqual({
            kind: "enum",
            enum: ["One", "Two", "Three"],
        });
    });
    (0, bun_test_1.test)("numbers", function () {
        var _a = (0, cast_1.castEnumType)(["1", "2", "3"]), type = _a.type, propInfos = _a.propInfos;
        (0, bun_test_1.expect)(propInfos.required).toEqual(true);
        (0, bun_test_1.expect)(type).toEqual({
            kind: "enum",
            enum: ["1", "2", "3"],
        });
    });
    (0, bun_test_1.test)("optionals, string literals, numbers", function () {
        var _a = (0, cast_1.castEnumType)([
            "undefined",
            "null",
            '"One"',
            '"Two"',
            '"Three"',
            "1",
            "2",
            "3",
        ]), type = _a.type, propInfos = _a.propInfos;
        (0, bun_test_1.expect)(propInfos.required).toEqual(false);
        (0, bun_test_1.expect)(type).toEqual({
            kind: "union",
            union: [
                {
                    kind: "enum",
                    enum: ["One", "Two", "Three"],
                },
                {
                    kind: "enum",
                    enum: ["1", "2", "3"],
                },
            ],
        });
    });
    (0, bun_test_1.test)("primitive", function () {
        var _a = (0, cast_1.castEnumType)(["number"]), type = _a.type, propInfos = _a.propInfos;
        (0, bun_test_1.expect)(propInfos.required).toEqual(true);
        (0, bun_test_1.expect)(type).toEqual("decimal");
    });
    (0, bun_test_1.test)("primitives", function () {
        var _a = (0, cast_1.castEnumType)(["number", "string"]), type = _a.type, propInfos = _a.propInfos;
        (0, bun_test_1.expect)(propInfos.required).toEqual(true);
        (0, bun_test_1.expect)(type).toEqual({
            kind: "union",
            union: ["decimal", "string"],
        });
    });
    (0, bun_test_1.test)("optional primitives", function () {
        var _a = (0, cast_1.castEnumType)(["undefined", "number", "string"]), type = _a.type, propInfos = _a.propInfos;
        (0, bun_test_1.expect)(propInfos.required).toEqual(false);
        (0, bun_test_1.expect)(type).toEqual({
            kind: "union",
            union: ["decimal", "string"],
        });
    });
});
