const fetch = require('node-fetch');
const { saveTransaction, updateLeaderboard } = require('./database');

async function fetchTransactions() {
    const API_URL = 'https://dialog-tbot.com/history/ft-transfers/';
    const params = new URLSearchParams({
        wallet_id: 'se_la_via.tg',
        direction: 'in',
        limit: '200',
        skip: '0'
    });

    try {
        const response = await fetch(`${API_URL}?${params}`, {
            headers: { 'accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let newTransactions = 0;

        // Обрабатываем транзакции в обратном порядке
        for (const tx of data.transactions.reverse()) {
            if (await saveTransaction(tx)) {
                newTransactions++;
            }
        }

        console.log(`Добавлено новых транзакций: ${newTransactions}`);

        if (newTransactions > 0) {
            await updateLeaderboard();
            console.log('Лидерборд обновлен');
        }
    } catch (error) {
        console.error('Ошибка при загрузке транзакций:', error);
    }
}

module.exports = fetchTransactions;
