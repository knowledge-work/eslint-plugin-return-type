# eslint-plugin-return-type

ESLint plugin to enforce the access of specific return types.

## Requirements

- ESLint 8.40 or later (tested with ESLint 10)
- [`@typescript-eslint/parser`](https://typescript-eslint.io/packages/parser) with type information enabled ([typed linting](https://typescript-eslint.io/getting-started/typed-linting))

This plugin has no runtime dependencies.

## Installation

```sh
npm install --save-dev eslint-plugin-return-type
# or
pnpm add --save-dev eslint-plugin-return-type
```

## Supported Rules

- [`enforce-access`](docs/rules/enforce-access.md)
  - `typeNames`: `string[]`
    - Type names whose values must be accessed. Each entry is a regular expression that must match the whole type name.

## Usage

### Flat config (`eslint.config.js`)

```js
import tsParser from "@typescript-eslint/parser";
import returnType from "eslint-plugin-return-type";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "return-type": returnType,
    },
    rules: {
      "return-type/enforce-access": ["error", { typeNames: ["SomeType", "\\w*Error"] }],
    },
  },
];
```

### Legacy config (`.eslintrc`)

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["return-type"],
  "rules": {
    "return-type/enforce-access": ["error", { "typeNames": ["SomeType", "\\w*Error"] }]
  }
}
```

## Development

Requires Node.js (see `.node-version`) and pnpm (see `packageManager` in `package.json`).

```sh
pnpm install
pnpm test       # Vitest
pnpm build      # Compile to dist/
pnpm fmt        # Format with oxfmt
pnpm fmt:check
```

## Release

The [Publish](.github/workflows/publish.yml) workflow publishes to npm with [trusted publishing](https://docs.npmjs.com/trusted-publishers).

- It runs on the 15th of every month (patch release), or manually from the Actions tab with `patch`, `minor`, or `major`.
- The job runs in the `npm` environment and waits for approval before publishing.
- It bumps the version, publishes the package, pushes the version commit and tag, and creates a GitHub release.

## License

MIT
