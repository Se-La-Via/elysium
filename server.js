const express = require('express');
const cron = require('node-cron');
const fetchTransactions = require('./scheduler');
const { getLeaderboard } = require('./database');

const app = express();
const port = process.env.PORT || 3000;

// Статические файлы
app.use(express.static('public'));

// Запуск планировщика (каждые 5 минут)
cron.schedule('*/5 * * * *', () => {
    console.log('Запуск загрузки транзакций...');
    fetchTransactions();
});

// API для получения лидерборда
app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await getLeaderboard();
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    // Первоначальная загрузка данных
    fetchTransactions();
});
