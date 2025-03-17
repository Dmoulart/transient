import { describe, expect, test } from "bun:test";
import { castEnumType } from "../src/analyzers/cast";

describe("enum types normalization", () => {
  test("boolean", () => {
    const { type } = castEnumType(["true", "false"]);

    expect(type).toEqual("boolean");
  });

  test("optional with undefined", () => {
    const { type, propInfos } = castEnumType(["undefined", "true", "false"]);
    expect(propInfos!.required).toEqual(false);
    expect(type).toEqual("boolean");
  });

  test("optional with null", () => {
    const { type, propInfos } = castEnumType(["null", "true", "false"]);
    expect(propInfos!.required).toEqual(false);
    expect(type).toEqual("boolean");
  });

  test("optional with both null and undefined", () => {
    const { type, propInfos } = castEnumType([
      "null",
      "undefined",
      "true",
      "false",
    ]);
    expect(propInfos!.required).toEqual(false);
    expect(type).toEqual("boolean");
  });

  test("string literals", () => {
    const { type, propInfos } = castEnumType(['"One"', '"Two"', '"Three"']);
    expect(propInfos!.required).toEqual(true);
    expect(type).toEqual({
      kind: "enum",
      enum: ["One", "Two", "Three"],
    });
  });

  test("numbers", () => {
    const { type, propInfos } = castEnumType(["1", "2", "3"]);
    expect(propInfos!.required).toEqual(true);
    expect(type).toEqual({
      kind: "enum",
      enum: ["1", "2", "3"],
    });
  });

  test("optionals, string literals, numbers", () => {
    const { type, propInfos } = castEnumType([
      "undefined",
      "null",
      '"One"',
      '"Two"',
      '"Three"',
      "1",
      "2",
      "3",
    ]);

    expect(propInfos!.required).toEqual(false);
    expect(type).toEqual({
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

  test("primitive", () => {
    const { type, propInfos } = castEnumType(["number"]);

    expect(propInfos!.required).toEqual(true);
    expect(type).toEqual("decimal");
  });

  test("primitives", () => {
    const { type, propInfos } = castEnumType(["number", "string"]);

    expect(propInfos!.required).toEqual(true);

    expect(type).toEqual({
      kind: "union",
      union: ["decimal", "string"],
    });
  });

  test("optional primitives", () => {
    const { type, propInfos } = castEnumType(["undefined", "number", "string"]);

    expect(propInfos!.required).toEqual(false);

    expect(type).toEqual({
      kind: "union",
      union: ["decimal", "string"],
    });
  });
});
