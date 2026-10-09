import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Single client pattern for serverless environments
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!connectionString) {
    return null;
  }
  if (!dbInstance) {
    const client = postgres(connectionString, { prepare: false });
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

export { schema };
