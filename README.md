# SimpleStore To-Do (example)

A small to-do app in plain JavaScript that uses [`@nullvector/simplestore`](https://www.npmjs.com/package/@nullvector/simplestore) (`/web` entry, localStorage) to persist its data.

It shows:
- `createStorage({ adapter: webAdapter(), prefix: 'todo-app:' })`: a namespaced store
- `get` / `multiSet` / `keys` / `multiGet` for loading and saving state
- `clear()` that removes only this app's keys
- catching `SimpleStoreError` and showing its `code`

## Run

```bash
npm install
npm run build     # writes dist/index.html
```

Open `dist/index.html` in a browser. Add items, reload, and they're still there.
