// A tiny to-do app that persists everything with SimpleStore.
import { createStorage, webAdapter, SimpleStoreError } from '@nullvector/simplestore/web';

// Namespaced store: keys() / clear() only touch "todo-app:*" keys.
const store = createStorage({ adapter: webAdapter(), prefix: 'todo-app:' });

let todos = []; // [{ id, text, done }]
let filter = 'all'; // 'all' | 'active' | 'done'

const $ = (sel) => document.querySelector(sel);
const list = $('#list');
const input = $('#new');
const status = $('#status');
const keysView = $('#keys');

function showError(e) {
  status.textContent =
    e instanceof SimpleStoreError ? `Storage error (${e.code}): ${e.message}` : String(e);
  status.className = 'status error';
}

async function save() {
  try {
    await store.multiSet([
      ['todos', todos],
      ['filter', filter],
      ['updatedAt', new Date().toISOString()],
    ]);
    status.textContent = 'Saved';
    status.className = 'status';
  } catch (e) {
    showError(e);
  }
  render();
}

async function renderKeys() {
  const keys = await store.keys();
  const rows = await store.multiGet(keys);
  keysView.textContent = rows
    .map(({ key, value }) => `todo-app:${key} = ${JSON.stringify(value)}`)
    .join('\n') || '(empty)';
}

function render() {
  const visible = todos.filter((t) =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done
  );
  list.replaceChildren(
    ...visible.map((t) => {
      const li = document.createElement('li');
      li.className = t.done ? 'done' : '';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = t.done;
      cb.onchange = () => {
        t.done = cb.checked;
        void save();
      };
      const span = document.createElement('span');
      span.textContent = t.text;
      const del = document.createElement('button');
      del.textContent = '×';
      del.title = 'Delete';
      del.onclick = () => {
        todos = todos.filter((x) => x.id !== t.id);
        void save();
      };
      li.append(cb, span, del);
      return li;
    })
  );
  const left = todos.filter((t) => !t.done).length;
  $('#count').textContent = `${left} item${left === 1 ? '' : 's'} left`;
  document.querySelectorAll('[data-filter]').forEach((b) => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });
  void renderKeys();
}

$('#form').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ id: crypto.randomUUID(), text, done: false });
  input.value = '';
  void save();
});

document.querySelectorAll('[data-filter]').forEach((b) => {
  b.onclick = () => {
    filter = b.dataset.filter;
    void save();
  };
});

$('#clear-done').addEventListener('click', () => {
  todos = todos.filter((t) => !t.done);
  void save();
});

$('#reset').addEventListener('click', async () => {
  await store.clear(); // removes only todo-app:* keys
  todos = [];
  filter = 'all';
  status.textContent = 'All app data cleared';
  render();
});

// Load saved state on startup.
(async () => {
  try {
    todos = (await store.get('todos')) ?? [];
    filter = (await store.get('filter')) ?? 'all';
    const at = await store.get('updatedAt');
    status.textContent = at ? `Loaded — last saved ${new Date(at).toLocaleString()}` : 'New list';
  } catch (e) {
    showError(e);
  }
  render();
})();
