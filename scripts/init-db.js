import Database from 'better-sqlite3';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

async function initializeDatabase() {
  try {
    // Crear directorio para la base de datos
    await mkdir(join(process.cwd(), 'public', 'db'), { recursive: true });
    
    // Crear y configurar la base de datos
    const db = new Database(join(process.cwd(), 'public', 'db', 'rates.db'));
    
    // Crear tablas
    db.exec(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        currency TEXT NOT NULL,
        buy_rate REAL NOT NULL,
        sell_rate REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_averages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        currency TEXT NOT NULL,
        avg_buy_rate REAL NOT NULL,
        avg_sell_rate REAL NOT NULL,
        date DATE NOT NULL,
        variation_buy REAL DEFAULT 0,
        variation_sell REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_timestamp 
        ON exchange_rates(currency, timestamp);

      CREATE INDEX IF NOT EXISTS idx_daily_averages_currency_date 
        ON daily_averages(currency, date);
    `);

    console.log('Base de datos inicializada correctamente');
    db.close();
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase();
