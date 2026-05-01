# Habr Career Parser

Habr Career Parser is a small Node.js service that fetches vacancies from the Habr Career frontend API, validates the payload with Zod, and stores normalized vacancy and skill data in a local SQLite database through Prisma. It can run once on demand or stay alive as an hourly scheduled worker using Bree.

## What the project does

- Requests the first page of Habr Career vacancies.
- Validates the API response with strict Zod schemas.
- Upserts vacancies and skills into SQLite.
- Runs on a schedule or as a one-time job.

## Project structure

- `src/index.ts` starts the scheduler or runs the worker immediately with `--run-now`.
- `src/workers/vacancies.ts` fetches, validates, and persists vacancies.
- `src/schemas/habr-vacancies.ts` defines the API contract.
- `src/scripts/verify-vacancies-schema.ts` validates the checked-in sample payload in `Response.json`.
- `prisma/schema.prisma` defines the SQLite models.

## Local usage

1. Install dependencies:

```bash
npm install
```

2. Create the database schema:

```bash
npm run prisma:push
```

3. Build the project:

```bash
npm run build
```

4. Run once:

```bash
npm run start:now
```

5. Run the hourly scheduler:

```bash
npm run start
```

## Validation

Use the sample payload check when changing the parser or Zod schema:

```bash
npx tsx src/scripts/verify-vacancies-schema.ts
```

## Docker + SQLite

SQLite is a local file database, so the database file must be stored outside the container if you want to keep data after restart. This project uses `DATABASE_URL=file:./data/dev.db` and mounts a host directory into `/app/data`.

1. Start the container:

```bash
docker compose up --build -d
```

2. The SQLite file will appear on the host in:

```text
./data/dev.db
```

3. Stop the service without losing data:

```bash
docker compose down
```

The container runs `prisma db push` on startup and then starts the scheduler. If you only want a single parser run in Docker, override the command:

```bash
docker compose run --rm habr-scraper sh -c "npx prisma db push && node dist/index.js --run-now"
```

## Configuration

Copy `.env.example` to `.env` if you want to override the default database path:

```bash
DATABASE_URL=file:./data/dev.db
```
