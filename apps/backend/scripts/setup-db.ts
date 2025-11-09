import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'data.db');
const schemaPath = join(__dirname, 'schema.sql');

console.log('Setting up database...');

const db = new Database(dbPath);
const schema = readFileSync(schemaPath, 'utf-8');

db.exec(schema);

console.log('✓ Database setup complete');
db.close();
