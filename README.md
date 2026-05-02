# Habr Career Parser — parser that collects Habr Career vacancies into a local database.

[Features](#features) · [Tech Stack](#tech-stack) · [Quick Start](#quick-start) · [Environment Variables](#environment-variables)

│ TypeScript vacancy ingestion service with Zod validation, Prisma, SQLite, and Bree scheduling.

## Features

- Fetches vacancy data from the Habr Career frontend API.
- Validates the response contract with strict Zod schemas.
- Upserts vacancies, skills, and relationships into SQLite.
- Runs once on demand or on an hourly Bree schedule.
- Includes Docker support and a schema verification script for sample payloads.

## Tech Stack

```text
┌────────────┬──────────────────────────────────────────────┐
│ Layer      │ Technology                                   │
├────────────┼──────────────────────────────────────────────┤
│ Runtime    │ Node.js / TypeScript                         │
├────────────┼──────────────────────────────────────────────┤
│ HTTP       │ fetch                                         │
├────────────┼──────────────────────────────────────────────┤
│ Scheduling │ Bree                                         │
├────────────┼──────────────────────────────────────────────┤
│ Database   │ Prisma ORM / SQLite / better-sqlite3        │
├────────────┼──────────────────────────────────────────────┤
│ Validation │ Zod                                          │
├────────────┼──────────────────────────────────────────────┤
│ Infra      │ Docker / GitHub Actions                     │
└────────────┴──────────────────────────────────────────────┘
```

## Quick Start

```bash
git clone https://github.com/Umalanif/Career.habr-parser.git
cd Career.habr-parser
cp .env.example .env
npm install
npm run prisma:push
npm run build
npm run start:now
```

## Environment Variables

```text
┌──────────────┬────────────────────────────────────┬──────────┐
│ Variable     │ Description                        │ Required │
├──────────────┼────────────────────────────────────┼──────────┤
│ DATABASE_URL │ SQLite database path               │ No       │
└──────────────┴────────────────────────────────────┴──────────┘
```

## Project Structure

```text
src/
  index.ts
  schemas/
    habr-vacancies.ts
  scripts/
    verify-vacancies-schema.ts
  workers/
    vacancies.ts
prisma/
  schema.prisma
data/
  dev.db
.github/workflows/
  docker.yml
Response.json
```

## License

Not specified.
