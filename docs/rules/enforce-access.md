# enforce-access

Enforces that a value returned from a function is accessed when its type matches one of the `typeNames` option.

It can be used, for example, to enforce error handling by specifying custom error types.

## Options

- `typeNames`: `string[]`
  - Each entry is a regular expression that must match the whole type name (for example, `\w*Error` matches `CustomError`).

## What counts as an access

- Assigned to a variable
- Stored in an array or an object
- Passed to another function or a class constructor
- Returned from the enclosing function (the caller is expected to access it)

An `await`ed value is checked at the `await` expression instead.

Some cases may be missing. Pull requests are welcome.

## Examples

`typeNames: ['\w*Error', 'ExperimentalValue']`

```ts
function example() {
  return new CustomError("reason");
}
```

### Incorrect

```ts
example();

await example();
```

### Correct

```ts
const res = example();

const res = await example();

otherFunction(example());
```
