import type ts from "typescript";

// Minimal types for the parts of ESLint and typescript-eslint that this plugin uses.
// They are written here instead of depending on `@typescript-eslint/utils`.
//
// References:
// - ESLint custom rule format:
//   https://eslint.org/docs/latest/extend/custom-rules
// - RuleModule / RuleContext (`@typescript-eslint/utils` v8.72.2):
//   https://github.com/typescript-eslint/typescript-eslint/blob/v8.72.2/packages/utils/src/ts-eslint/Rule.ts
// - TSESTree nodes (`@typescript-eslint/ast-spec` v8.72.2):
//   https://github.com/typescript-eslint/typescript-eslint/tree/v8.72.2/packages/ast-spec/src
// - ParserServicesWithTypeInformation (`@typescript-eslint/typescript-estree` v8.72.2):
//   https://github.com/typescript-eslint/typescript-eslint/blob/v8.72.2/packages/typescript-estree/src/parser-options.ts

/**
 * An AST node. Only the properties this plugin reads are declared.
 */
export interface Node {
  type: string;
  parent?: Node;
  /** ArrowFunctionExpression */
  body?: unknown;
  /** ArrayExpression */
  elements?: unknown[];
  /** Property */
  value?: unknown;
  /** CallExpression / NewExpression */
  callee?: unknown;
  /** AssignmentExpression */
  right?: unknown;
}

/**
 * Parser services provided by `@typescript-eslint/parser` when type information is enabled.
 */
export interface ParserServicesWithTypeInformation {
  program: ts.Program;
  esTreeNodeToTSNodeMap: { get(node: Node): ts.Node };
}

export interface RuleContext<MessageIds extends string, Options extends readonly unknown[]> {
  options: Options;
  sourceCode: {
    parserServices?: Partial<ParserServicesWithTypeInformation>;
  };
  report(descriptor: { node: Node; messageId: MessageIds; data?: Record<string, string> }): void;
}

export interface RuleModule<MessageIds extends string, Options extends readonly unknown[]> {
  meta: {
    type: "problem" | "suggestion" | "layout";
    docs?: { description: string; url?: string };
    schema: unknown[];
    messages: Record<MessageIds, string>;
  };
  create(context: Readonly<RuleContext<MessageIds, Options>>): Record<string, (node: Node) => void>;
}
