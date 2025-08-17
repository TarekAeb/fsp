import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "@/db/types";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  }),
});

export const db = new Kysely<DB>({
  dialect,
});