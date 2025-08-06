// Initialize environment variables first
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables first, before any other imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load from multiple possible locations
const envPaths = [
  resolve(__dirname, '.env'),
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), 'dist', '.env')
];

for (const path of envPaths) {
  try {
    const result = dotenv.config({ path });
    if (result.parsed) {
      console.log(`✅ Loaded environment variables from ${path}`);
      break;
    }
  } catch (error) {
    console.log(`⚠️ Failed to load environment variables from ${path}:`, error);
  }
}

// Set up Supabase environment variables
// Hardcode the password for development purposes
process.env.SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || 'uday85499';

if (process.env.SUPABASE_DB_PASSWORD) {
  // Explicitly set DATABASE_URL for Supabase connection
  const dbUrl = `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.mbevcelithyytcdbvrxx.supabase.co:5432/postgres`;
  process.env.DATABASE_URL = dbUrl;
  process.env.SUPABASE_URL = 'https://mbevcelithyytcdbvrxx.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'sb_publishable_rTqRlr0PDAPvaOd-7GgNzQ_0puIqbFv';
  console.log('✅ Supabase environment configured with DATABASE_URL:', dbUrl);
} else {
  console.log('⚠️ SUPABASE_DB_PASSWORD not found, using in-memory storage');
}

// Export a dummy function to ensure this file is imported
export function ensureEnvironmentLoaded() {
  return true;
}