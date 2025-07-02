import sqlite3
from datetime import datetime

def init_db():
    conn = sqlite3.connect('transactions.db')
    c = conn.cursor()
    
    # Создаем таблицу для транзакций
    c.execute('''CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                wallet TEXT NOT NULL,
                token TEXT NOT NULL,
                amount REAL NOT NULL,
                tx_hash TEXT UNIQUE)''')  # Уникальный идентификатор транзакции
    
    # Создаем таблицу для лидерборда (кэш)
    c.execute('''CREATE TABLE IF NOT EXISTS leaderboard (
                token TEXT PRIMARY KEY,
                total_amount REAL NOT NULL,
                last_updated TEXT)''')
    
    conn.commit()
    conn.close()

def save_transaction(tx):
    conn = sqlite3.connect('transactions.db')
    c = conn.cursor()
    
    try:
        # Проверяем дубликаты по хэшу транзакции
        c.execute("INSERT OR IGNORE INTO transactions (date, wallet, token, amount, tx_hash) VALUES (?, ?, ?, ?, ?)",
                  (tx['time'], tx['from_wallet_id'], tx['symbol'], tx['amount'], tx['tx_hash']))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False  # Дубликат
    finally:
        conn.close()

def update_leaderboard():
    conn = sqlite3.connect('transactions.db')
    c = conn.cursor()
    
    # Рассчитываем сумму по токенам
    c.execute("SELECT token, SUM(amount) as total FROM transactions GROUP BY token")
    results = c.fetchall()
    
    # Обновляем лидерборд
    current_time = datetime.now().isoformat()
    for token, total in results:
        c.execute("INSERT OR REPLACE INTO leaderboard (token, total_amount, last_updated) VALUES (?, ?, ?)",
                 (token, total, current_time))
    
    conn.commit()
    conn.close()

def get_leaderboard():
    conn = sqlite3.connect('transactions.db')
    c = conn.cursor()
    c.execute("SELECT token, total_amount FROM leaderboard ORDER BY total_amount DESC LIMIT 20")
    leaderboard = c.fetchall()
    conn.close()
    return leaderboard