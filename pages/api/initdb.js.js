import { pool } from '../../lib/db';

export default async function handler(req, res) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL,
        wallet VARCHAR(255) NOT NULL,
        token VARCHAR(50) NOT NULL,
        amount NUMERIC NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_wallet ON transactions(wallet);
    `);
    res.status(200).json({ message: "Таблицы созданы" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}