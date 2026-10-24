import { describe, expect, test } from "bun:test";
import type { TransientElement } from "./definition";
import { findNearestAncestor, getPathOfElementById } from "./ast";

describe("ast", () => {
  const elements: TransientElement[] = [
    {
      id: "1",
      tag: "ComponentA",
      attributes: {},
      slots: {
        default: [
          {
            id: "2",
            tag: "Nested",
            attributes: {},
            isComponent: false,
          },
          {
            id: "3",
            tag: "Nested",
            attributes: {},
            isComponent: false,
          },
          {
            id: "4",
            tag: "Nested",
            attributes: {},
            isComponent: false,
            slots: {
              default: [
                {
                  id: "5",
                  tag: "Nested",
                  attributes: {},
                  isComponent: false,
                },
              ],
            },
          },
        ],
      },
      isComponent: true,
    },
    {
      id: "2",
      tag: "ComponentB",
      attributes: {},
      isComponent: false,
    },
  ];
  test("getPathOfElementById", () => {
    const path = getPathOfElementById(elements, "3");
    expect(path).toEqual([0, "slots", "default", 1]);
  });

  test("getPathOfElementById", () => {
    const nested = findNearestAncestor(
      elements,
      "5",
      (element) => element.isComponent,
    );
    expect(nested).toBeDefined();
    expect(nested!.id).toEqual("1");

    const direct = findNearestAncestor(
      elements,
      "2",
      (element) => element.isComponent,
    );
    expect(direct).toBeDefined();
    expect(direct!.id).toEqual("1");

    const none = findNearestAncestor(
      elements,
      "1",
      (element) => element.isComponent,
    );
    expect(none).toBeUndefined();
  });
});
