import Bree from "bree";
import path from "node:path";

const VACANCIES_JOB_NAME = "vacancies";
const VACANCIES_JOB_INTERVAL = "1h";

function createScheduler(): Bree {
  return new Bree({
    root: false,
    jobs: [
      {
        name: VACANCIES_JOB_NAME,
        path: path.join(__dirname, "workers", "vacancies.js"),
        timeout: false,
        interval: VACANCIES_JOB_INTERVAL,
      },
    ],
  });
}

async function runNow(): Promise<void> {
  const { executeVacanciesWorker } = await import("./workers/vacancies");
  await executeVacanciesWorker();
}

async function startScheduler(): Promise<void> {
  const scheduler = createScheduler();

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    console.log(
      JSON.stringify(
        {
          mode: "scheduler",
          status: "stopping",
          signal,
        },
        null,
        2,
      ),
    );
    await scheduler.stop();
    process.exit(0);
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  await scheduler.start();

  console.log(
    JSON.stringify(
      {
        mode: "scheduler",
        status: "started",
        jobs: [
          {
            name: VACANCIES_JOB_NAME,
            interval: VACANCIES_JOB_INTERVAL,
          },
        ],
      },
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  if (process.argv.includes("--run-now")) {
    await runNow();
    return;
  }

  await startScheduler();
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
