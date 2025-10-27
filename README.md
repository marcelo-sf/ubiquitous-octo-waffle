# MapperExp

A tiny, deterministic transformation layer that maps data from a source object to a target shape using a declarative mapping and small, pure transform functions.

- **Predictable input to transforms.** Transforms always receive a named object whose keys mirror your `sources` declaration (plus `{ source }` in context).
- **Clear error reporting.** Any thrown error is wrapped with the target path:
  `Transformation failed at field "path.to.field": <reason>`.
- **Validation built in.** Type + constraints (string/number/boolean/array/object/null) are supported.
- **No mutation.** Neither the source object nor the mapping is ever mutated.

---

## Install

```bash
npm install mapper-exp
```

> The library is plain JS, no runtime deps beyond Node.

---

## Quick start

```js
const DataMapper = require('./data-mapper');

const mapping = [
  // 1) Simple rename
  {
    sources: { name: 'user_name' },
    target: 'userName',
    type: 'string',
    required: true
  },

  // 2) Compute from multiple fields
  {
    sources: { first: 'first_name', last: 'last_name' },
    target: 'fullName',
    type: 'string',
    transform: (input) => [input.first, input.last].filter(Boolean).join(' '),
    required: true
  },

  // 3) Default + validation
  {
    sources: { value: 'age' },
    target: 'userAge',
    type: 'number',
    default: 0
  },

  // 4) Nested target path
  {
    sources: { email: 'contact.email' },
    target: 'requester.email',
    type: 'string'
  }
];

const mapper = new DataMapper({ mapping });

const out = mapper.transform({
  user_name: 'jdoe',
  first_name: 'John',
  last_name: 'Doe',
  contact: { email: 'john.doe@example.com' }
});

console.log(out);
/*
{
  userName: 'jdoe',
  fullName: 'John Doe',
  userAge: 0,
  requester: { email: 'john.doe@example.com' }
}
*/
```

---

## Mapping rule reference

Each rule is an object with:

| Field       | Type         | Required | Description |
|-------------|--------------|----------|-------------|
| `target`    | `string`     | ✅       | Target path to set (dot/bracket syntax supported). |
| `sources`   | `object`     | ✅*      | **Named selectors**. Keys are names you control; values are source selectors (paths). The transform input will mirror these keys. If you don’t need inputs (pure default), omit `sources`. |
| `transform` | `function`   | ❌       | `(input, { source }) => any`. Receives the **named input object**, plus a context containing the full `source`. If omitted, the adapter forwards the raw extracted value(s). |
| `type`      | `string`     | ❌       | One of: `string`, `number`, `boolean`, `array`, `object`, `null`. Used for validation. |
| `default`   | `any`        | ❌       | Applied when the transform result is `undefined` or when no value was produced. |
| `required`  | `boolean`    | ❌       | If `true`, the rule must produce a defined, non-`undefined` value **after defaults** or an error is thrown. |

\* For simple single-field rules you may set `sources: { value: 'path.to.field' }` and read `input.value` in your transform, or omit `transform` and the adapter forwards `input.value`.

---

## Transform function contract

**Signature**

```ts
(value: Record<string, any>, ctx: { source: any }) => any
```

- `value` is **always an object** whose keys mirror your `sources`.
  Example:

  ```js
  {
    sources: { first: 'first_name', last: 'last_name' },
    transform: (input) => [input.first, input.last].filter(Boolean).join(' ')
  }
  ```

- `ctx.source` is the complete, original source object (handy for transforms that need broader context).

**Return value**

- Whatever you return is what gets validated and written to `target`.
- If you return `undefined`, the adapter will try `default` (if present). If it’s still `undefined` and `required: true`, the adapter throws.

---

## Selector syntax

Selectors are simple path strings against the source object (dot and bracket notation supported). Examples:

- `user.name`
- `contact.email`
- `items[0].sku`
- `metadata['x-custom']`

Missing paths resolve to `undefined` (they do not throw). This is intentional to keep transforms pure and predictable.

---

## Validation

If you specify a `type`, the adapter validates the final value (post-transform, post-default). Basic constraints supported today:

- **string**: optional `minLength`, `maxLength`, `pattern` (RegExp string).
- **number**: optional `integer` (boolean), `min`, `max`.
- **boolean**, **array**, **object**, **null**: type-only checks.

Validation errors are wrapped with the target field path:

```
Transformation failed at field "userAge": Expected type number
```

> The validators live in `src/string-validator.js`, `number-validator.js`, etc., and are exposed via `src/validators.js`.

---

## Defaults and `required`

Order of operations for each rule:

1. Build named **input** from `sources` (missing selectors become `undefined`).
2. If `transform` exists, call it with `(input, { source })`. Otherwise, use the passthrough input:
   - If exactly one source key (e.g., `{ value: 'age' }`), the passthrough is that single value.
   - If multiple keys, the passthrough is the **named object**.
3. **Apply `default`** if the value is `undefined`.
4. **Validate** if `type` (and constraints) are provided.
5. If `required: true` and the value is still `undefined`, throw.
6. If value is `undefined`, **do not create** the target key. Otherwise, set it at `target`.

---

## Error handling

All errors (including thrown by your transform) are wrapped with the current rule’s `target` to pinpoint the failure:

```text
Transformation failed at field "requester.name": <original error message>
```

---

## Immutability guarantees

- The original `source` object is never mutated.
- Your `mapping` array and rule objects are not mutated.

---

## Worked example: ServiceNow → REST payload

```js
const mapping = [
  // top-level
  { sources: { id: 'sys_id' }, target: 'id', type: 'string', required: true },
  { sources: { short: 'short_description' }, target: 'title', type: 'string', required: true },

  // requester block
  {
    sources: { first: 'caller.first_name', last: 'caller.last_name' },
    target: 'requester.name',
    type: 'string',
    transform: (input) => [input.first, input.last].filter(Boolean).join(' '),
    required: true
  },
  {
    sources: { email: 'caller.email' },
    target: 'requester.email',
    type: 'string',
    required: true
  },

  // optional mapping with default
  {
    sources: { priority: 'priority' },
    target: 'severity',
    type: 'number',
    default: 3
  }
];

const mapper = new DataMapper({ mapping });

const out = mapper.transform({
  sys_id: 'INC00123',
  short_description: 'VPN not connecting',
  caller: { first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' }
});

console.log(out);
/*
{
  id: 'INC00123',
  title: 'VPN not connecting',
  requester: { name: 'John Doe', email: 'john.doe@example.com' },
  severity: 3
}
*/
```

---

## API

```ts
new DataMapper(options: {
  mapping: Rule[]
  extractor?: { get(obj: any, path: string): any }
  setter?:    { set(obj: any, path: string, value: any): void }
  validators?: { get(type: string): (value: any, constraints?: any) => void }
})

transform(source: any): any
```

If you don’t provide `extractor`, `setter`, or `validators`, sensible defaults from `src/value-extractor.js`, `src/value-setter.js`, and `src/validators.js` are used.

---

## Testing notes (what the repo’s tests assert)

- Transforms always get **named input** mapped from `sources`.
- Context object includes `{ source }`.
- `default` applies only when the value is `undefined`.
- `required` is enforced **after** defaults.
- Missing selectors never throw; they resolve to `undefined`.
- Nested `target` paths are created as needed.
- Source and mapping remain unchanged.

---

## License

GPL-3.0
