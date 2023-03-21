# eslint-plugin-return-type

ESlint plugin to enforces the access of specific return types.

NOTE: `eslint-plugin-return-type` uses tsconfig, tsconfig.json must be present.

## Installation

```
npm install eslint-plugin-return-type --save-dev
```

## Supported Rules

- enforce-access
  - typeNames: `string[]`
    - Type name to enforce access

## Usage

.eslintrc:

```js
"plugins": [
  "return-type",
],
"rules": {
  "return-type/enforce-access": [
    "error",
    { "typeNames": ["SomeType"] }
}
```

## License

MIT
