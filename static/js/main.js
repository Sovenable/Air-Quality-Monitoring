

// Inisialisasi charts
let tempChart, humidityChart, smokeChart, gasChart;

// Format timestamp jadi waktu yang bisa dibaca
function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('id-ID');
}

// Update data terkini
function updateLatestData() {
    fetch('/api/latest-data')
        .then(response => response.json())
        .then(data => {
            if (data && !data.error) {
                // Update nilai sensor
                document.getElementById('temperature').textContent = data.temperature ? data.temperature.toFixed(1) : '--';
                document.getElementById('humidity').textContent = data.humidity ? data.humidity.toFixed(1) : '--';
                document.getElementById('smoke').textContent = data.smoke || '--';
                document.getElementById('gas').textContent = data.gas || '--';
                
                // Update status aktuator
                const ventStatus = document.getElementById('ventilation-status');
                ventStatus.textContent = data.ventilation ? 'TERBUKA' : 'TERTUTUP';
                ventStatus.className = 'badge ' + (data.ventilation ? 'bg-success' : 'bg-secondary');
                
                const fanStatus = document.getElementById('fan-status');
                fanStatus.textContent = data.fan ? 'HIDUP' : 'MATI';
                fanStatus.className = 'badge ' + (data.fan ? 'bg-success' : 'bg-secondary');
                
                // Update waktu terakhir
                if (data.timestamp) {
                    document.getElementById('last-update').textContent = formatTimestamp(data.timestamp);
                }
            }
        })
        .catch(error => console.error('Error:', error));
}

// Ambil data historis buat grafik
function updateHistoricalData() {
    fetch('/api/historical-data')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                // Sortir data berdasarkan timestamp
                data.sort((a, b) => a.timestamp - b.timestamp);
                
                // Format data buat grafik
                const labels = data.map(item => {
                    const date = new Date(item.timestamp * 1000);
                    return date.toLocaleTimeString();
                });
                
                const tempData = data.map(item => item.temperature);
                const humidityData = data.map(item => item.humidity);
                const smokeData = data.map(item => item.smoke);
                const gasData = data.map(item => item.gas);
                
                // Update charts
                updateChart(tempChart, labels, tempData, 'rgba(255, 99, 132, 0.5)');
                updateChart(humidityChart, labels, humidityData, 'rgba(54, 162, 235, 0.5)');
                updateChart(smokeChart, labels, smokeData, 'rgba(255, 206, 86, 0.5)');
                updateChart(gasChart, labels, gasData, 'rgba(75, 192, 192, 0.5)');
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function buat update chart
function updateChart(chart, labels, data, backgroundColor) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

// Inisialisasi chart
function initChart(canvasId, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                backgroundColor: color,
                borderColor: color.replace('0.5', '1'),
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Jalanin pas page load
document.addEventListener('DOMContentLoaded', () => {
    // Init charts
    tempChart = initChart('tempChart', 'Suhu (°C)', 'rgba(255, 99, 132, 0.5)');
    humidityChart = initChart('humidityChart', 'Kelembaban (%)', 'rgba(54, 162, 235, 0.5)');
    smokeChart = initChart('smokeChart', 'Level Asap', 'rgba(255, 206, 86, 0.5)');
    gasChart = initChart('gasChart', 'Level Gas', 'rgba(75, 192, 192, 0.5)');
    
    // Ambil data pertama kali
    updateLatestData();
    updateHistoricalData();
    
    // Setup refresh otomatis
    setInterval(updateLatestData, 5000); // Refresh data terkini tiap 5 detik
    setInterval(updateHistoricalData, 60000); // Refresh grafik tiap 1 menit
    
    // Event listener buat dropdown waktu
    document.getElementById('timeRange').addEventListener('change', updateHistoricalData);
});
