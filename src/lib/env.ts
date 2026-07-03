/**
 * Loads variables from a local `.env` file into `process.env` for development.
 *
 * In production, real environment variables should be provided by the host; if
 * no `.env` file exists this is a harmless no-op. Importing this module for its
 * side effect ensures env vars are available before they are read.
 */
try {
  process.loadEnvFile();
} catch {
  // No .env file present — rely on the ambient environment.
}

export {};
