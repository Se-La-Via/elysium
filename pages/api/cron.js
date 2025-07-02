import { pool } from '../../lib/db';

export default async function handler(req, res) {
  // Проверка на вызов из Cron
  if (!req.headers['x-vercel-id']?.startsWith('cron::')) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const response = await fetch(
      'https://dialog-tbot.com/history/ft-transfers/?wallet_id=se_la_via.tg&direction=in&limit=200&skip=0',
      { headers: { 'Accept': 'application/json' } }
    );
    
    const { transfers } = await response.json();
    
    if (!transfers || !Array.isArray(transfers)) {
      return res.status(200).json({ message: "Нет новых данных" });
    }

    const values = transfers.map(t => [
      t.id,
      new Date(t.timestamp * 1000), // Конвертация Unix времени
      t.from,
      t.token,
      parseFloat(t.amount)
    ]);

    const result = await pool.query(`
      INSERT INTO transactions (id, timestamp, wallet, token, amount)
      SELECT * FROM UNNEST(
        $1::text[], 
        $2::timestamptz[], 
        $3::text[], 
        $4::text[], 
        $5::numeric[]
      )
      ON CONFLICT (id) DO NOTHING
    `, [
      values.map(v => v[0]),
      values.map(v => v[1]),
      values.map(v => v[2]),
      values.map(v => v[3]),
      values.map(v => v[4])
    ]);

    res.status(200).json({
      added: result.rowCount,
      total: transfers.length
    });
  } catch (error) {
    console.error('Cron error:', error);
    res.status(500).json({ error: error.message });
  }
}