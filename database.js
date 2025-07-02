const sqlite3 = require('sqlite3').verbose();

// Инициализация базы данных
const db = new sqlite3.Database('transactions.db');

db.serialize(() => {
    // Создаем таблицу транзакций
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        wallet TEXT NOT NULL,
        token TEXT NOT NULL,
        amount REAL NOT NULL,
        tx_hash TEXT UNIQUE
    )`);
    
    // Создаем таблицу лидерборда
    db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
        token TEXT PRIMARY KEY,
        total_amount REAL NOT NULL
    )`);
});

// Сохранение транзакции
function saveTransaction(transaction) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR IGNORE INTO transactions (date, wallet, token, amount, tx_hash) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                transaction.time,
                transaction.from_wallet_id,
                transaction.symbol,
                transaction.amount,
                transaction.tx_hash
            ],
            function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0); // true если добавлена новая запись
            }
        );
    });
}

// Обновление лидерборда
function updateLeaderboard() {
    return new Promise((resolve, reject) => {
        // Рассчитываем суммы по токенам
        db.run(`DELETE FROM leaderboard`, () => {
            db.run(
                `INSERT INTO leaderboard (token, total_amount)
                 SELECT token, SUM(amount) 
                 FROM transactions 
                 GROUP BY token`,
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    });
}

// Получение данных для лидерборда
function getLeaderboard() {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT token, total_amount 
             FROM leaderboard 
             ORDER BY total_amount DESC 
             LIMIT 10`,
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

module.exports = {
    saveTransaction,
    updateLeaderboard,
    getLeaderboard
};
