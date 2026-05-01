# Repository Guidelines

## Project Structure & Module Organization
`src/` holds the TypeScript source. Use `src/index.ts` for Bree scheduler startup, `src/workers/` for executable jobs, `src/schemas/` for Zod validators, and `src/scripts/` for one-off verification utilities. `prisma/schema.prisma` defines the SQLite models, and `prisma/dev.db` is the local database file. `dist/` is generated output from `tsc`; make source changes in `src/` and rebuild before shipping.

## Build, Test, and Development Commands
`npm run build` compiles TypeScript to `dist/`.

`npm run start` starts the hourly scheduler.

`npm run start:now` runs the vacancy pipeline immediately.

`npm run worker` executes only the compiled worker.

`npm run prisma:generate` refreshes the Prisma client after schema edits.

`npm run prisma:push` syncs the Prisma schema into `prisma/dev.db`.

`npx tsx src/scripts/verify-vacancies-schema.ts` validates `Response.json` against the Zod schema.

## Coding Style & Naming Conventions
Keep `strict` TypeScript clean. Match the existing style: 2-space indentation, double quotes, trailing commas in multiline literals, and explicit return types on exported functions. Prefer descriptive PascalCase type names such as `VacanciesWorkerResult`, and keep filenames lowercase with hyphens, for example `habr-vacancies.ts`.

## Testing Guidelines
There is no dedicated test runner configured in this workspace. At minimum, run `npm run build` and `npx tsx src/scripts/verify-vacancies-schema.ts` before submitting changes. For worker or persistence updates, also run `npm run start:now` and confirm the JSON summary and expected writes in `prisma/dev.db`. Add small verification scripts under `src/scripts/` when a change needs repeatable validation.

## Commit & Pull Request Guidelines
This checkout does not include `.git`, so repository-specific commit history is unavailable. Use short, imperative commit subjects such as `Normalize predicted salary fields`. Keep related source, Prisma, and regenerated `dist/` changes together. PRs should describe the behavior change, list the commands you ran, call out database or schema impact, and include sample log output when scheduler or worker behavior changes.

## Configuration & Data Notes
The app currently uses a local SQLite datasource at `file:./prisma/dev.db`. Avoid hardcoding alternate paths in code; update `prisma.config.ts` if configuration must change. Treat `Response.json` and local log files as debugging artifacts, and refresh them only when they directly support a parser or schema change.
