import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Ensure database URL is defined
const databaseUrl = process.env.POSTGRES_URL;
if (!databaseUrl) {
  console.error("POSTGRES_URL environment variable is not defined");
  process.exit(1);
}

// Function to run migrations
async function runMigration() {
  console.log("Starting database migration...");
  
  // Create postgres client with type assertion since we checked for undefined above
  const migrationClient = postgres(databaseUrl as string, { max: 1 });
  
  try {
    // Create schema if it doesn't exist
    await migrationClient`CREATE SCHEMA IF NOT EXISTS "drizzle"`;
    console.log("Schema check completed");
    
    // Create database connection with drizzle
    const db = drizzle(migrationClient);
    
    // Run migrations
    await migrate(db, { migrationsFolder: "lib/drizzle" });
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // End the connection
    await migrationClient.end();
  }
}

// Run the migration
runMigration();
