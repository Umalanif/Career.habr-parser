import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { isMainThread, parentPort } from "node:worker_threads";
import { habrVacanciesApiResponseSchema } from "../schemas/habr-vacancies";
import type { HabrVacancy } from "../schemas/habr-vacancies";

const HABR_VACANCIES_API_URL =
  "https://career.habr.com/api/frontend/vacancies";
const HABR_BASE_URL = "https://career.habr.com";

const HABR_VACANCIES_QUERY = {
  sort: "relevance",
  type: "all",
  currency: "RUR",
  page: "1",
} as const;

const HABR_REQUEST_HEADERS = {
  accept: "application/json",
  "accept-language": "en-US,en;q=0.7",
  referer: "https://career.habr.com/vacancies?page=1&type=all",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
  } as const;

const DATABASE_URL = process.env.DATABASE_URL ?? "file:./data/dev.db";

function ensureSqliteDirectory(databaseUrl: string): void {
  if (!databaseUrl.startsWith("file:")) {
    return;
  }

  const sqlitePath = databaseUrl.slice("file:".length);
  const resolvedPath = path.resolve(process.cwd(), sqlitePath);
  mkdirSync(path.dirname(resolvedPath), { recursive: true });
}

ensureSqliteDirectory(DATABASE_URL);

const sqliteAdapter = new PrismaBetterSqlite3({
  url: DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: sqliteAdapter,
});

type VacancyPersistenceInput = {
  habrId: number;
  title: string;
  companyTitle: string;
  remoteWork: boolean;
  salaryFrom: number | null;
  salaryTo: number | null;
  salaryCurrency: string | null;
  salaryFormatted: string;
  predictedSalaryFrom: number | null;
  predictedSalaryTo: number | null;
  predictedSalaryCurrency: string | null;
  predictedSalaryFormatted: string | null;
  publishedAt: Date;
  href: string;
  skills: string[];
};

function toVacancyPersistenceInput(
  vacancy: HabrVacancy,
): VacancyPersistenceInput {
  return {
    habrId: vacancy.id,
    title: vacancy.title,
    companyTitle: vacancy.company.title,
    remoteWork: vacancy.remoteWork,
    salaryFrom: vacancy.salary.from,
    salaryTo: vacancy.salary.to,
    salaryCurrency: vacancy.salary.currency,
    salaryFormatted: vacancy.salary.formatted,
    predictedSalaryFrom: vacancy.predictedSalary?.from ?? null,
    predictedSalaryTo: vacancy.predictedSalary?.to ?? null,
    predictedSalaryCurrency: vacancy.predictedSalary?.currency ?? null,
    predictedSalaryFormatted: vacancy.predictedSalary?.formatted ?? null,
    publishedAt: new Date(vacancy.publishedDate.date),
    href: new URL(vacancy.href, HABR_BASE_URL).toString(),
    skills: [...new Set(vacancy.skills.map((skill) => skill.title))],
  };
}

async function upsertVacancy(
  vacancy: VacancyPersistenceInput,
): Promise<void> {
  const { skills, ...vacancyData } = vacancy;

  await prisma.vacancy.upsert({
    where: {
      habrId: vacancy.habrId,
    },
    create: {
      ...vacancyData,
      vacancySkills: {
        create: skills.map((title) => ({
          skill: {
            connectOrCreate: {
              where: { title },
              create: { title },
            },
          },
        })),
      },
    },
    update: {
      ...vacancyData,
      vacancySkills: {
        deleteMany: {},
        create: skills.map((title) => ({
          skill: {
            connectOrCreate: {
              where: { title },
              create: { title },
            },
          },
        })),
      },
    },
  });
}

export type VacanciesWorkerResult = {
  page: number;
  validatedVacancies: number;
  upsertedVacancies: number;
  totalPages: number;
  requestId: string | null;
};

export async function runVacanciesWorker(): Promise<VacanciesWorkerResult> {
  const url = new URL(HABR_VACANCIES_API_URL);

  for (const [key, value] of Object.entries(HABR_VACANCIES_QUERY)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: HABR_REQUEST_HEADERS,
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Habr API request failed with status ${response.status}`);
  }

  const parsed = habrVacanciesApiResponseSchema.parse(await response.json());
  const vacancies = parsed.list.map(toVacancyPersistenceInput);

  for (const vacancy of vacancies) {
    await upsertVacancy(vacancy);
  }

  return {
    page: parsed.meta.currentPage,
    validatedVacancies: parsed.list.length,
    upsertedVacancies: vacancies.length,
    totalPages: parsed.meta.totalPages,
    requestId: response.headers.get("x-request-id"),
  };
}

export async function executeVacanciesWorker(): Promise<void> {
  try {
    const result = await runVacanciesWorker();

    console.log(JSON.stringify(result, null, 2));

    if (parentPort) {
      parentPort.postMessage("done");
    }
  } catch (error: unknown) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (!isMainThread || require.main === module) {
  void executeVacanciesWorker();
}
