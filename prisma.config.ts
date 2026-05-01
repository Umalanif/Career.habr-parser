import { defineConfig } from "prisma/config";

const DATABASE_URL = process.env.DATABASE_URL ?? "file:./data/dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL,
  },
});
