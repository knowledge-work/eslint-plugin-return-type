import { ESLintUtils, TSESTree } from '@typescript-eslint/utils'
import ts from 'typescript'

import { createRule } from '../utils'

type MessageIds = 'enforceAccess'
type Options = [{ typeNames: string[] }]

export = createRule<Options, MessageIds>({
  name: __filename,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforces the access of specific return types in functions and ensures they are referenced properly.',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          typeNames: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            additionalItems: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      enforceAccess: '{{typeName}} must be accessed.',
    },
  },
  defaultOptions: [{ typeNames: [] }],
  create(context, [{ typeNames }]) {
    const parserServices = ESLintUtils.getParserServices(context)
    const checker = parserServices.program.getTypeChecker()

    const checkAccess = (node: TSESTree.Node) => {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node)
      const type = checker.getTypeAtLocation(tsNode)
      const matchedTypeName = findMatchedTypeName(type, typeNames, checker)

      // 値の型名がtypeNamesとマッチしていなければ終了
      if (!matchedTypeName) {
        return
      }

      // parentがなければチェック不可能で終了
      if (!node.parent) {
        return
      }

      // 値の参照のチェック

      // - awaitされていたらその先でチェックされるので終了
      if (node.parent.type === 'AwaitExpression') {
        return
      }

      // - 値が自分の所属する関数の返り値になっていたら呼び出し先で参照されるとみなして終了
      if (
        node.parent.type === 'ReturnStatement' ||
        (node.parent.type === 'ArrowFunctionExpression' && node.parent.body === node)
      ) {
        return
      }

      // - 値が配列やオブジェクトに格納されていたらそれ越しに参照されるとみなして終了
      if (
        (node.parent.type === 'ArrayExpression' && node.parent.elements.includes(node as any)) ||
        (node.parent.type === 'Property' && node.parent.value === node)
      ) {
        return
      }

      // - 値が別の関数に渡っていたら参照されているとみなして終了
      if (
        (node.parent.type === 'CallExpression' || node.parent.type === 'NewExpression') &&
        node.parent.callee !== node
      ) {
        return
      }

      // - 値が変数に格納されていたら no-unused-vars 側で参照チェックできるので終了
      if (
        node.parent.type === 'VariableDeclarator' ||
        (node.parent.type === 'AssignmentExpression' && node.parent.right === node)
      ) {
        return
      }

      context.report({
        node,
        messageId: 'enforceAccess',
        data: {
          typeName: matchedTypeName,
        },
      })
    }

    return {
      CallExpression: checkAccess,
      ArrowFunctionExpression: checkAccess,
      FunctionDeclaration: checkAccess,
      AwaitExpression: checkAccess,
    }
  },
})

function findMatchedTypeName(
  type: ts.Type,
  targetNames: string[],
  checker: ts.TypeChecker,
): string | null {
  // unionならそれぞれをチェック
  if (type.isUnion()) {
    const targetType = type.types.find((t) => findMatchedTypeName(t, targetNames, checker) !== null)
    return targetType ? findMatchedTypeName(targetType, targetNames, checker) : null
  }

  const typeName = checker.typeToString(type)
  const targetNameRegexps = targetNames.map((name) => new RegExp(`^${name}$`))
  const matched = targetNameRegexps.find((regexp) => regexp.test(typeName))

  return matched ? matched.toString() : null
}
