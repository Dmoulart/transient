import { parse as parseSFC } from "@vue/compiler-sfc";
import {
  baseParse,
  NodeTypes,
  type AttributeNode,
  type DirectiveNode,
  type ElementNode,
  type TemplateChildNode,
  type TextNode,
} from "@vue/compiler-dom";
import { readFileSync } from "fs";
import type {
  BindingInfo,
  TransientProps,
  TransientTemplate,
  TransientElement,
} from "../../transient/definition";
import { assertIs, someString } from "../../core/assert";
import crypto from "crypto";
let id = 0;

export function analyzeTemplateElements(
  componentPath: string,
  props: TransientProps
): TransientTemplate | undefined {
  const source = readFileSync(componentPath, "utf-8");
  const sfc = parseSFC(source);

  const template = sfc.descriptor.template?.content;

  if (!template) return;

  const ast = baseParse(template);

  const elements = ast.children
    .map((node) => walk(node, props))
    .filter(Boolean) as TransientElement[];

  return { elements };
}

function walk(
  node: TemplateChildNode,
  props: TransientProps
): TransientElement | null {
  let el: TransientElement | null = null;

  switch (node.type) {
    case NodeTypes.TEXT:
      el = parseText(node);
      break;
    case NodeTypes.ELEMENT:
      el = parseElement(node, props);
      break;
  }

  // if (node.type === NodeTypes.INTERPOLATION) {
  //   if ("content" in node.content) {
  //     return {
  //       tag: "#text",
  //       isComponent: false,
  //       attributes: {
  //         value: { type: "prop", expression: node.content.content.trim() },
  //       },
  //     };
  //   }
  //   // not implemented
  //   return null;
  // }

  // Handle named slots defined via <template #slotName> or <template v-slot:slotName>

  return el;
}

function parseText(node: TextNode): TransientElement | null {
  const content = node.content;

  if (!content) return null;

  return {
    id: crypto.randomUUID(),
    tag: "#text",
    isComponent: false,
    attributes: {
      value: { type: "literal", expression: content },
    },
  };
}

function parseElement(
  node: ElementNode,
  props: TransientProps
): TransientElement | null {
  const tag = node.tag;

  const isComponent = /^[A-Z]/.test(tag);
  const attributes = parseElementAttributes(node.props, props);

  const children = node.children
    .map((child) => walk(child, props))
    .filter(Boolean) as TransientElement[];

  return {
    id: crypto.randomUUID(),
    tag,
    isComponent,
    attributes,
    children: children.length > 0 ? children : undefined,
  };
}

function parseElementAttributes(
  props: (AttributeNode | DirectiveNode)[],
  componentProps: TransientProps
): Record<string, BindingInfo> {
  const attributes: Record<string, BindingInfo> = {};

  for (const prop of props) {
    if (prop.type === NodeTypes.DIRECTIVE) {
      if (prop.arg && "content" in prop.arg) {
        const key = `${prop.name}${prop.arg ? `:${prop.arg.content}` : ""}`;

        if (prop.name === "slot") {
          const slotName = prop.arg.content;
          attributes["v-slot"] = { type: "literal", expression: slotName };
        } else if (prop.exp && "content" in prop.exp) {
          const value = extractBindingValue(prop.exp.content, componentProps);
          attributes[key] = value;
        }
      }
    } else if (prop.type === NodeTypes.ATTRIBUTE) {
      const key = prop.name;
      if (prop.value?.content !== undefined) {
        attributes[key] = {
          type: "literal",
          expression: prop.value.content,
        };
      } else {
        attributes[key] = {
          type: "literal",
          expression: true,
        };
      }
    }
  }

  return attributes;
}

function extractBindingValue(
  content: string,
  props: TransientProps
): BindingInfo {
  // Literal: string
  if (/^(['"]).*\1$/.test(content)) {
    return { type: "literal", expression: content.slice(1, -1) };
  }

  // Literal: number
  if (!isNaN(Number(content))) {
    return { type: "literal", expression: Number(content) };
  }

  // Literal: boolean
  if (content === "true") {
    return { type: "literal", expression: true };
  }
  if (content === "false") {
    return { type: "literal", expression: false };
  }

  // Check if it's a declared prop
  if (content in props) {
    return { type: "prop", expression: content };
  }

  return { type: "prop", expression: "not supported" };
  // Not supported
  // throw new Error(`binding value not implemented for ${content}`);
}
