# Changelog

## 1.0.0

- Core `createStorage` API: `set`, `get`, `has`, `remove`, `keys`, `clear`, `multiSet`, `multiGet`.
- Optional `prefix` namespace; scopes `keys()` and `clear()` to that prefix.
- Adapters: `webAdapter("local" | "session")`, `asyncStorageAdapter`, `memoryAdapter`, or any custom `StorageAdapter`.
- Entry points: `simplestore`, `/web`, `/react-native`, `/react` (`useStorage` hook).
- Typed `SimpleStoreError` with error codes.
- SSR-safe: nothing touches `window` at import time.
