from apscheduler.schedulers.background import BackgroundScheduler
import requests
from db import save_transaction, update_leaderboard

def fetch_transactions():
    API_URL = "https://dialog-tbot.com/history/ft-transfers/"
    params = {
        'wallet_id': 'se_la_via.tg',
        'direction': 'in',
        'limit': 200,
        'skip': 0
    }
    
    headers = {'accept': 'application/json'}
    
    try:
        response = requests.get(API_URL, params=params, headers=headers)
        if response.status_code == 200:
            data = response.json()
            new_count = 0
            
            # Обрабатываем транзакции в обратном порядке (от старых к новым)
            for tx in reversed(data.get('transactions', [])):
                if save_transaction(tx):
                    new_count += 1
            
            print(f"Добавлено новых транзакций: {new_count}")
            
            # Обновляем лидерборд если есть новые данные
            if new_count > 0:
                update_leaderboard()
        else:
            print(f"Ошибка API: {response.status_code}")
    except Exception as e:
        print(f"Ошибка при запросе: {str(e)}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(fetch_transactions, 'interval', minutes=5)
    scheduler.start()
    print("Сервис обновления транзакций запущен (каждые 5 минут)")