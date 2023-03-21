import rule from '../../src/rules/enforce-access'
import { TSESLint } from '@typescript-eslint/utils'

export const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.test.json',
  },
})

const commonCode = `
  type UsecaseResult<T, E extends Error | null> = Ok<T> | Err<E>;

  type Ok<T> = {
    readonly ok: true;
    readonly val: T;
    readonly err: null;
  };

  type Err<E extends Error | null> = {
    readonly ok: false;
    readonly val: null;
    readonly err: E;
  };

  export const usecaseResultOk = <T>(val: T): Ok<T> => ({
    ok: true,
    val,
    err: null,
  })

  export const usecaseResultError = <E extends Error | null>(err: E): Err<E> => ({
    ok: false,
    val: null,
    err,
  });

  class CustomError extends Error {}

`

ruleTester.run('enforce-access', rule, {
  valid: [
    {
      code: `${commonCode}
        const example = () => usecaseResultError(new Error('error'))
        const res = example();
      `,
      options: [{ typeNames: ['Err<Error>'] }],
    },
    {
      code: `${commonCode}
        const example = async () => {
          return usecaseResultError(new Error('error'))
        }
        const res = await example();
      `,
      options: [{ typeNames: ['Err<Error>'] }],
    },
    {
      code: `${commonCode}
        const example = async () => usecaseResultError(new Error('error'))
        otherFunction(await example());
      `,
      options: [{ typeNames: ['Err<Error>'] }],
    },
    {
      code: `${commonCode}
        const example = async () => usecaseResultError(null)
        await example();
      `,
      options: [{ typeNames: ['Err<Error>'] }],
    },
    {
      code: `${commonCode}
        const example = async (): Ok<string> | Err<Error> => {
          return usecaseResultError(new Error('error'))
        }
        const res = await example();
      `,
      options: [{ typeNames: ['Err<Error>'] }],
    },
    {
      code: `
        const example = () => {
          return new CustomError('error')
        }
        example();
      `,
      options: [{ typeNames: ['Error'] }],
    },
  ],
  invalid: [
    {
      code: `${commonCode}
        const example = () => usecaseResultError(new Error('error'))
        example();
      `,
      options: [{ typeNames: ['Err<Error>'] }],
      errors: [{ messageId: 'enforceAccess' }],
    },
    {
      code: `${commonCode}
        const example =  (): Ok<string> | Err<Error> => {
          return usecaseResultError(new Error('error'))
        }
        example();
      `,
      options: [{ typeNames: ['Err<Error>'] }],
      errors: [{ messageId: 'enforceAccess' }],
    },
    {
      code: `${commonCode}
        const example = async () => usecaseResultError(new Error('error'))
        await example();
      `,
      options: [{ typeNames: ['Err<Error>'] }],
      errors: [{ messageId: 'enforceAccess' }],
    },
    {
      code: `${commonCode}
        const example = async (): Ok<string> | Err<Error> => {
          return usecaseResultError(new Error('error'))
        }
        await example();
      `,
      options: [{ typeNames: ['Err<Error>'] }],
      errors: [{ messageId: 'enforceAccess' }],
    },
    {
      code: `${commonCode}
        const example = () => {
          usecaseResultError(new Error('error'))
        }
      `,
      options: [{ typeNames: ['Err<Error>'] }],
      errors: [{ messageId: 'enforceAccess' }],
    },
    {
      code: `${commonCode}
        const example = () => {
          return usecaseResultError(new CustomError('error'))
        }
        await example()
      `,
      options: [{ typeNames: ['Err<\\w*Error>'] }],
      errors: [{ messageId: 'enforceAccess' }],
    },
    {
      code: `${commonCode}
        const example = () => {
          return new CustomError('error')
        }
        example();
      `,
      options: [{ typeNames: ['\\w*Error'] }],
      errors: [{ messageId: 'enforceAccess' }],
    },
  ],
})
