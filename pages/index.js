import { useState, useEffect } from 'react';

export default function Home() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const response = await fetch('/api/leaders');
        const data = await response.json();
        setLeaders(data);
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>TON Leaderboard</h1>
      
      {loading ? (
        <p>Загрузка данных...</p>
      ) : leaders.length === 0 ? (
        <p>Нет данных для отображения</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Кошелек</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Сумма (TON)</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Транзакции</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((leader, index) => (
              <tr 
                key={leader.wallet}
                style={{ borderBottom: '1px solid #ddd' }}
              >
                <td style={{ padding: '10px' }}>
                  {index === 0 ? '🥇 ' : 
                   index === 1 ? '🥈 ' : 
                   index === 2 ? '🥉 ' : ''}
                  {leader.wallet}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  {leader.total.toFixed(2)}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  {leader.transactions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <footer style={{ marginTop: '30px', textAlign: 'center', color: '#666' }}>
        Данные обновляются каждые 5 минут
      </footer>
    </div>
  );
}