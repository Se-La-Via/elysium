let leaderboardChart;

async function loadLeaderboardData() {
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        updateChart(data);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        alert('Ошибка при загрузке данных. Попробуйте позже.');
    }
}

function updateChart(data) {
    const tokens = data.map(item => item.token);
    const amounts = data.map(item => item.total_amount);
    
    const colors = [
        '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', 
        '#e74a3b', '#858796', '#5a5c69', '#3a3b45',
        '#2e59d9', '#17a673'
    ];
    
    const ctx = document.getElementById('leaderboardChart').getContext('2d');
    
    if (leaderboardChart) {
        leaderboardChart.destroy();
    }
    
    leaderboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tokens,
            datasets: [{
                label: 'Общая сумма',
                data: amounts,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace(')', ', 0.8)').replace('rgb', 'rgba')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Сумма: ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Загрузка данных при открытии страницы
    loadLeaderboardData();
    
    // Кнопка обновления
    document.getElementById('refreshBtn').addEventListener('click', loadLeaderboardData);
    
    // Автообновление каждые 30 секунд
    setInterval(loadLeaderboardData, 30000);
});
