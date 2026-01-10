import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== ADATBÁZIS KAPCSOLAT TESZT ===\n');
console.log('Aktuális könyvtár:', __dirname);
console.log('.env fájl helye:', join(__dirname, '.env'));

// Explicit módon betöltjük a .env fájlt
const result = dotenv.config({ path: join(__dirname, '.env') });

if (result.error) {
  console.error('❌ .env betöltési hiba:', result.error);
  process.exit(1);
}

console.log('\n.env fájl betöltve:', result.parsed ? 'Igen' : 'Nem');
console.log('DATABASE_URL létezik?', !!process.env.DATABASE_URL);
console.log('DATABASE_URL hossza:', process.env.DATABASE_URL?.length || 0);

// Ha létezik, mutassuk a formátumát (jelszó nélkül)
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  const urlWithoutPassword = url.replace(/:([^@]+)@/, ':***@');
  console.log('Connection string:', urlWithoutPassword);
  
  // Elemezzük a connection stringet
  try {
    const parsed = new URL(url.replace('postgresql://', 'http://'));
    console.log('\nConnection részletek:');
    console.log('  Protocol:', 'postgresql://');
    console.log('  Username:', parsed.username);
    console.log('  Password:', parsed.password ? '***' : 'HIÁNYZIK!');
    console.log('  Host:', parsed.hostname);
    console.log('  Port:', parsed.port);
    console.log('  Database:', parsed.pathname.slice(1));
  } catch (e) {
    console.error('❌ Connection string formátum hiba:', e.message);
  }
} else {
  console.error('❌ DATABASE_URL nem található a .env fájlban!');
  process.exit(1);
}

console.log('\n');

// Próbáljunk kapcsolódni
async function testConnection() {
  try {
    console.log('Kapcsolódás...');
    const sql = postgres(process.env.DATABASE_URL, { 
      ssl: { rejectUnauthorized: false },
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    });
    
    const result = await sql`SELECT NOW(), current_user, current_database()`;
    
    console.log('✅ SIKERES KAPCSOLAT!');
    console.log('Szerver idő:', result[0].now);
    console.log('Felhasználó:', result[0].current_user);
    console.log('Adatbázis:', result[0].current_database);
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ HIBA:');
    console.error('Üzenet:', error.message);
    console.error('Kód:', error.code);
    console.error('\nTeljes hiba:', error);
    process.exit(1);
  }
}

testConnection();