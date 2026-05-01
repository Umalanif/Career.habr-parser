import { z } from "zod";

const hrefSchema = z.string().startsWith("/");
const nullableStringSchema = z.string().nullable();
const nullableIntegerSchema = z.number().int().nullable();

const linkTitleSchema = z
  .object({
    title: z.string(),
    href: hrefSchema,
  })
  .strict();

const salarySchema = z
  .object({
    from: nullableIntegerSchema,
    to: nullableIntegerSchema,
    currency: nullableStringSchema,
    formatted: z.string(),
  })
  .strict();

const publishedDateSchema = z
  .object({
    date: z.string().datetime({ offset: true }),
    title: z.string(),
  })
  .strict();

const companyRatingSchema = z
  .object({
    title: z.string(),
    value: z.string(),
    href: hrefSchema,
  })
  .strict();

const companySchema = z
  .object({
    id: z.number().int(),
    alias_name: z.string(),
    href: hrefSchema,
    title: z.string(),
    accredited: z.boolean(),
    logo: z
      .object({
        src: z.string().url(),
      })
      .strict(),
    rating: companyRatingSchema.nullable(),
  })
  .strict();

const reactionItemSchema = z
  .object({
    name: z.string(),
    title: z.string(),
    hasReacted: z.boolean(),
    count: z.number().int(),
    image: hrefSchema,
  })
  .strict();

const vacancySchema = z
  .object({
    id: z.number().int(),
    href: hrefSchema,
    title: z.string(),
    isMarked: z.boolean(),
    remoteWork: z.boolean(),
    salaryQualification: linkTitleSchema.nullable(),
    publishedDate: publishedDateSchema,
    location: z.null(),
    company: companySchema,
    employment: z.string().nullable(),
    salary: salarySchema,
    divisions: z.array(linkTitleSchema),
    skills: z.array(linkTitleSchema),
    media: z.null(),
    locations: z.array(linkTitleSchema).nullable(),
    favorite: z.boolean(),
    archived: z.boolean(),
    hidden: z.boolean(),
    can_edit: z.boolean(),
    userVacancyBanHref: hrefSchema,
    quickResponseHref: hrefSchema,
    qualification: z.string().nullable(),
    predictedSalary: salarySchema.nullable(),
    reactions: z
      .object({
        items: z.array(reactionItemSchema),
        fallbackHref: z.string().url(),
      })
      .strict(),
    response: z
      .object({
        kind: z.string(),
      })
      .strict(),
    hasPublishedCBP: z.boolean(),
    color: z.string().nullable(),
  })
  .strict();

export const habrVacanciesApiResponseSchema = z
  .object({
    list: z.array(vacancySchema),
    meta: z
      .object({
        totalResults: z.number().int(),
        perPage: z.number().int(),
        currentPage: z.number().int(),
        totalPages: z.number().int(),
      })
      .strict(),
    recommendedQuickVacancies: z.array(z.unknown()),
  })
  .strict();

export type HabrVacanciesApiResponse = z.infer<
  typeof habrVacanciesApiResponseSchema
>;

export type HabrVacancy = z.infer<typeof vacancySchema>;
