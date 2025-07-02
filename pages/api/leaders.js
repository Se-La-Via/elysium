import { pool } from '../../lib/db';

export default async function handler(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT 
        wallet,
        SUM(amount) AS total,
        COUNT(*) AS transactions
      FROM transactions
      GROUP BY wallet
      ORDER BY total DESC
      LIMIT 10
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}