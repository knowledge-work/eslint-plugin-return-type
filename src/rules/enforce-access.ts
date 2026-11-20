import type ts from "typescript";

import type { Node, ParserServicesWithTypeInformation, RuleContext, RuleModule } from "../types";

type MessageIds = "enforceAccess";
type Options = [{ typeNames?: string[] }?];
type Context = Readonly<RuleContext<MessageIds, Options>>;

const getParserServices = (context: Context): ParserServicesWithTypeInformation => {
  // Same check and message as ESLintUtils.getParserServices:
  // https://github.com/typescript-eslint/typescript-eslint/blob/v8.72.2/packages/utils/src/eslint-utils/getParserServices.ts
  const program = context.sourceCode.parserServices?.program;
  const esTreeNodeToTSNodeMap = context.sourceCode.parserServices?.esTreeNodeToTSNodeMap;
  if (!program || !esTreeNodeToTSNodeMap) {
    throw new Error(
      "You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file. See https://typescript-eslint.io/getting-started/typed-linting for enabling linting with type information.",
    );
  }
  return { program, esTreeNodeToTSNodeMap };
};

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforces the access of specific return types in functions and ensures they are referenced properly.",
      url: "https://github.com/knowledge-work/eslint-plugin-return-type/blob/main/docs/rules/enforce-access.md",
    },
    schema: [
      {
        type: "object",
        properties: {
          typeNames: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
            additionalItems: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      enforceAccess: "{{typeName}} must be accessed.",
    },
  },
  create(context) {
    const typeNames = context.options[0]?.typeNames ?? [];
    const parserServices = getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    const checkAccess = (node: Node) => {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const type = checker.getTypeAtLocation(tsNode);
      const matchedTypeName = findMatchedTypeName(type, typeNames, checker);

      // 値の型名がtypeNamesとマッチしていなければ終了
      if (!matchedTypeName) {
        return;
      }

      // parentがなければチェック不可能で終了
      if (!node.parent) {
        return;
      }

      // 値の参照のチェック

      // - awaitされていたらその先でチェックされるので終了
      if (node.parent.type === "AwaitExpression") {
        return;
      }

      // - 値が自分の所属する関数の返り値になっていたら呼び出し先で参照されるとみなして終了
      if (
        node.parent.type === "ReturnStatement" ||
        (node.parent.type === "ArrowFunctionExpression" && node.parent.body === node)
      ) {
        return;
      }

      // - 値が配列やオブジェクトに格納されていたらそれ越しに参照されるとみなして終了
      if (
        (node.parent.type === "ArrayExpression" && node.parent.elements?.includes(node)) ||
        (node.parent.type === "Property" && node.parent.value === node)
      ) {
        return;
      }

      // - 値が別の関数に渡っていたら参照されているとみなして終了
      if (
        (node.parent.type === "CallExpression" || node.parent.type === "NewExpression") &&
        node.parent.callee !== node
      ) {
        return;
      }

      // - 値が変数に格納されていたら no-unused-vars 側で参照チェックできるので終了
      if (
        node.parent.type === "VariableDeclarator" ||
        (node.parent.type === "AssignmentExpression" && node.parent.right === node)
      ) {
        return;
      }

      context.report({
        node,
        messageId: "enforceAccess",
        data: {
          typeName: matchedTypeName,
        },
      });
    };

    return {
      CallExpression: checkAccess,
      ArrowFunctionExpression: checkAccess,
      FunctionDeclaration: checkAccess,
      AwaitExpression: checkAccess,
    };
  },
};

export = rule;

function findMatchedTypeName(
  type: ts.Type,
  targetNames: string[],
  checker: ts.TypeChecker,
): string | null {
  // unionならそれぞれをチェック
  if (type.isUnion()) {
    const targetType = type.types.find(
      (t) => findMatchedTypeName(t, targetNames, checker) !== null,
    );
    return targetType ? findMatchedTypeName(targetType, targetNames, checker) : null;
  }

  const typeName = checker.typeToString(type);
  const targetNameRegexps = targetNames.map((name) => new RegExp(`^${name}$`));
  const matched = targetNameRegexps.find((regexp) => regexp.test(typeName));

  return matched ? matched.toString() : null;
}
