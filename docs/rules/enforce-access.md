# enforce-access

関数などからの返り値が option の typeNames で指定された特定の型とマッチするとき、その値へのアクセスを強制します。

カスタムエラーの型を指定することによるエラーハンドリングの強制などに使えます。

## アクセスとは

- 変数へ格納される
- 配列やオブジェクトへ格納される
- 別の関数やクラスコンストラクタへ渡される

他、足りない条件があるかもしれないので、足りないものがあれば Pull Request をお待ちしています。

## Examples

`typeNames: ['\w*Error', 'ExperimentalValue']`

```ts
function example() {
  return new CustomError('reason')
}
```

### Incorrect

```ts
example()

await example()
```

### Correct

```ts
const res = example()

const res = await example()

otherFunction(example())
```
