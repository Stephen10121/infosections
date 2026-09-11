# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Testing

The unit/component test suite runs with **Bun's built-in test runner** — no extra framework needed.

```sh
# install dependencies (first time)
bun install

# run the whole suite once
bun run test

# re-run tests on every change
bun run test:watch

# run only the lib tests
bun test tests/lib

# run only a single file
bun test tests/lib/event.utils.test.ts
```

The suite lives in [`tests/`](./tests) and mirrors the app's source layout:

| Folder           | What it covers                                                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/lib/`     | Pure logic in `src/lib/*.ts` — `utils` (string/date/calendar helpers), `event.utils` (filter builders + event filtering), `cal.utils` (defaults), `valibotSchemaHelpers` (email schema) |
| `tests/remote/`  | SvelteKit remote functions (`*.remote.ts`) — business rules, validation, pocketbase CRUD and ownership checks                                                                           |
| `tests/helpers/` | Shared test doubles: `mock-app.ts` (mock of the virtual `$app/server` module + `svelte-sonner`) and `fake-pb.ts` (in-memory PocketBase client)                                          |

### How the remote-function tests work

The `*.remote.ts` modules import the virtual module `$app/server`, which only
exists inside the SvelteKit runtime. `tests/helpers/mock-app.ts` registers a
[`bun` module mock](https://bun.com/docs/test/mocks) that mimics `command`,
`form`, `query` and `getRequestEvent`, so the real action/query handlers run
against an in-memory PocketBase fake. Because of how Bun's mocks work, test
files must import remote modules via **dynamic `import()` after** importing the
helper (each test file shows this pattern).

### Keeping CI green

The GitHub Action (`.github/workflows/check.yml`) runs both `bun run check`
(svelte-check) and `bun run test`. Tests live under `tests/`, which the
generated SvelteKit tsconfig type-checks, so test files must satisfy the repo's
strict compiler options (`noUnusedLocals`, `noPropertyAccessFromIndexSignature`,
etc.).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.13.2 create --template minimal --types ts --add tailwindcss="plugins:none" --install bun .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
