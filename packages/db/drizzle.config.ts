import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv'
config({
  path: '.env.local',
})


export default defineConfig({
  schema: './src/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql', // or 'mysql' | 'sqlite'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

