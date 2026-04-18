import "dotenv/config"
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

import { config } from "dotenv";
config({ path: ".env" })

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });

// export helper services
export * as services from "./services"
