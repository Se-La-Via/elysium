from flask import Flask, render_template
from db import get_leaderboard
from scheduler import start_scheduler
import threading

app = Flask(__name__)

# Инициализация БД при старте
@app.before_first_request
def initialize():
    from db import init_db
    init_db()
    
    # Запускаем планировщик в отдельном потоке
    scheduler_thread = threading.Thread(target=start_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()

@app.route('/')
def leaderboard():
    top_entries = get_leaderboard()
    return render_template('leaderboard.html', leaderboard=top_entries)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)