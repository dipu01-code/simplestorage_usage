# SimpleStore

One small async key-value API for **Web**, **React Native** and **Expo**. Values are stored as JSON; each platform's storage engine sits behind an adapter.

```bash
npm install @dipu01-code/simplestore
# React Native / Expo also need:
npm install @react-native-async-storage/async-storage
```

## Quick start

```ts
// Web (localStorage)
import { storage } from "@dipu01-code/simplestore/web";
// React Native / Expo (AsyncStorage)
import { storage } from "@dipu01-code/simplestore/react-native";

await storage.set("username", "Dipu");
await storage.set("profile", { name: "Dipu", course: "AI & ML" });

const username = await storage.get<string>("username"); // "Dipu"
const profile = await storage.get<{ name: string; course: string }>("profile");

await storage.has("profile"); // true
await storage.keys();         // ["username", "profile"]
await storage.remove("username");
await storage.clear();
```

## Entry points

| Import                                   | Exports                                                        | Needs                                       |
| ---------------------------------------- | -------------------------------------------------------------- | ------------------------------------------- |
| `@dipu01-code/simplestore`               | `createStorage`, `memoryAdapter`, `SimpleStoreError`, types    | nothing                                     |
| `@dipu01-code/simplestore/web`           | everything above + `storage` (localStorage), `webAdapter`      | a browser (safe to import during SSR)       |
| `@dipu01-code/simplestore/react-native`  | everything above + `storage` (AsyncStorage), `asyncStorageAdapter` | `@react-native-async-storage/async-storage` |
| `@dipu01-code/simplestore/react`         | `useStorage` hook                                              | `react` ≥ 16.8                              |

The web entry never loads AsyncStorage, and only `/react` loads React.

## API

All methods are async.

| Method                | Returns                     | Notes                                                    |
| --------------------- | --------------------------- | -------------------------------------------------------- |
| `set(key, value)`     | `void`                      | `value` must be JSON-serializable                        |
| `get<T>(key)`         | `T \| undefined`            | `undefined` when the key is missing                      |
| `has(key)`            | `boolean`                   |                                                          |
| `remove(key)`         | `void`                      | No-op if missing                                         |
| `keys()`              | `string[]`                  | Requires the adapter to implement `getAllKeys`           |
| `clear()`             | `void`                      | See [Namespaces](#namespaces--what-clear-deletes)        |
| `multiSet(entries)`   | `void`                      | `[[key, value], ...]`; all entries validated before any write |
| `multiGet<T>(keys)`   | `{ key, value }[]`          |                                                          |

### Custom setup

```ts
import { createStorage, memoryAdapter } from "@dipu01-code/simplestore";
import { webAdapter } from "@dipu01-code/simplestore/web";

const session = createStorage({ adapter: webAdapter("session") }); // sessionStorage
const testStore = createStorage({ adapter: memoryAdapter() });      // tests / SSR
```

### Namespaces & what `clear()` deletes

Without a `prefix`, `clear()` wipes the **entire** underlying store (all of localStorage / AsyncStorage, including other libraries' data). Pass a `prefix` to isolate your data:

```ts
const appStore = createStorage({ adapter: webAdapter(), prefix: "myapp:" });
await appStore.set("user", "Dipu"); // stored as "myapp:user"
await appStore.keys();              // ["user"]
await appStore.clear();             // removes only "myapp:*" keys
```

### Custom adapters

Implement this interface (`getAllKeys` is optional, but `keys()` and prefixed `clear()` need it):

```ts
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys?(): Promise<string[]>;
}
```

### React hook

```tsx
import { storage } from "@dipu01-code/simplestore/web";
import { useStorage } from "@dipu01-code/simplestore/react";

function Counter() {
  const { value, set, remove, loading, error } = useStorage<number>(storage, "count", 0);
  if (loading) return null;
  return <button onClick={() => set((value ?? 0) + 1)}>{value}</button>;
}
```

`initialValue` is shown while loading and when the key is missing; it is not written to storage. Two components using the same key do not sync with each other automatically.

## Errors

Every failure is thrown (never swallowed) as a `SimpleStoreError` with a `code`, and `original` holds the underlying error when there is one:

| Code                  | When                                                         |
| --------------------- | ------------------------------------------------------------ |
| `INVALID_KEY`         | Key is not a non-empty string                                |
| `UNSUPPORTED_VALUE`   | `undefined`, function, symbol or bigint                      |
| `SERIALIZATION_ERROR` | `JSON.stringify` failed (e.g. circular object)               |
| `MALFORMED_DATA`      | Stored value isn't valid JSON (written outside SimpleStore)  |
| `QUOTA_EXCEEDED`      | Storage is full                                              |
| `STORAGE_UNAVAILABLE` | No storage (SSR, blocked by privacy settings)                |
| `UNKNOWN_ERROR`       | Anything else                                                |

```ts
import { SimpleStoreError } from "@dipu01-code/simplestore";
try {
  await storage.set("big", hugeObject);
} catch (e) {
  if (e instanceof SimpleStoreError && e.code === "QUOTA_EXCEEDED") { /* ... */ }
}
```

## SSR (Next.js, Remix, …)

Importing `/web` on the server is safe. Without `window`, reads return `undefined` / `[]` and writes throw `STORAGE_UNAVAILABLE`. On the server, use `memoryAdapter()` instead, or only call storage in effects/client code.

## Security

localStorage, sessionStorage and AsyncStorage are **not encrypted** and any script on the page (or anyone with device access) can read them. Don't store passwords, auth tokens or other secrets here; use `expo-secure-store`, Keychain/Keystore, or httpOnly cookies instead.

## Development

```bash
npm install
npm run lint && npm run typecheck && npm test && npm run build
```

## License

MIT
