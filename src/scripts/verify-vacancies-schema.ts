import responseSample from "../../Response.json";
import { habrVacanciesApiResponseSchema } from "../schemas/habr-vacancies";

const parsed = habrVacanciesApiResponseSchema.parse(responseSample);

console.log(
  JSON.stringify(
    {
      validatedVacancies: parsed.list.length,
      totalPages: parsed.meta.totalPages,
    },
    null,
    2,
  ),
);
