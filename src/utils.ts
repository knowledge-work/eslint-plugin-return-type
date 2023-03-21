import * as path from 'path'
import { ESLintUtils } from '@typescript-eslint/utils'

export const createRule = ESLintUtils.RuleCreator((name) => {
  const dirname = path.relative(__dirname, path.dirname(name))
  const basename = path.basename(name, path.extname(name))
  return `https://github.com/knowledge-work/eslint-return-type/blob/master/docs/${dirname}/${basename}.md`
})
