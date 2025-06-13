import { parse as parseSFC } from "@vue/compiler-sfc";
import {
  baseParse,
  NodeTypes,
  type SimpleExpressionNode,
} from "@vue/compiler-dom";
import { readFileSync } from "fs";
import type {
  BindingInfo,
  TransientProps,
  TransientTemplate,
  TransientElement,
} from "../../transient/definition";
import { assertIs, someString } from "../../core/assert";

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

function walk(node: any, props: TransientProps): TransientElement | null {
  if (node.type === NodeTypes.TEXT) {
    const content = node.content;
    if (!content) return null;
    return {
      tag: "#text",
      isComponent: false,
      attributes: {
        value: { type: "literal", expression: content },
      },
    };
  }

  if (node.type === NodeTypes.INTERPOLATION) {
    return {
      tag: "#text",
      isComponent: false,
      attributes: {
        value: { type: "prop", expression: node.content.content.trim() },
      },
    };
  }

  // Handle named slots defined via <template #slotName> or <template v-slot:slotName>
  if (node.type === NodeTypes.ELEMENT && node.tag === "template") {
    let slotName = "default";

    for (const prop of node.props) {
      if (prop.type === NodeTypes.DIRECTIVE && prop.name === "slot") {
        if (prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION) {
          slotName = prop.arg.content;
        }
      }
    }

    const children = node.children
      .map((child: any) => walk(child, props))
      .filter(Boolean) as TransientElement[];

    // Instead of returning a template node, return children keyed by slot name
    return {
      tag: "template",
      isComponent: false,
      attributes: {
        name: { type: "literal", expression: slotName },
      },
      slots: {
        [slotName]: children,
      },
    };
  }

  if (node.type !== NodeTypes.ELEMENT) return null;

  const tag = node.tag;
  const isComponent = /^[A-Z]/.test(tag);

  const attributes: Record<string, BindingInfo> = {};

  for (const prop of node.props) {
    if (prop.type === NodeTypes.DIRECTIVE) {
      const key = `${prop.name}${prop.arg ? `:${prop.arg.content}` : ""}`;
      const value = extractBindingValue(prop.exp, props);
      if (value) {
        attributes[key] = value;
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

  // Walk children and flatten any <template #slotName> blocks into slots[slotName]
  const rawChildren = node.children
    .map((child: any) => walk(child, props))
    .filter(Boolean) as TransientElement[];

  const slots: Record<string, TransientElement[]> = {};

  for (const child of rawChildren) {
    if (
      child.tag === "template" &&
      child.slots &&
      child.attributes?.name?.expression
    ) {
      const slotName = child.attributes.name.expression;
      assertIs(someString, slotName);
      slots[slotName] = child.slots.default || [];
    } else {
      if (!slots.default) slots.default = [];
      slots.default.push(child);
    }
  }

  return {
    tag,
    isComponent,
    attributes,
    slots: Object.keys(slots).length ? slots : undefined,
  };
}

function extractBindingValue(
  exp: SimpleExpressionNode | undefined,
  props: TransientProps
): BindingInfo | undefined {
  if (!exp || !exp.content) return;

  const content = exp.content.trim();

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

  // Not supported
  return undefined;
}
