from flask import Flask, render_template, jsonify
import os
import requests
import json
from datetime import datetime, timedelta

app = Flask(__name__)

# Firebase config
FIREBASE_DATABASE_URL = "https://air-quality-monitoring-s-56791-default-rtdb.asia-southeast"
FIREBASE_API_KEY = "AIzaSyDxVJSM1eheDUW444wypn1exK_-5BA0EII"

@app.route('/')
def index():
    return render_template('index.html', firebase_config={
        'apiKey': FIREBASE_API_KEY,
        'databaseURL': FIREBASE_DATABASE_URL,
        'projectId': "air-quality-monitoring-s-56791"
    })

@app.route('/api/latest-data')
def get_latest_data():
    # Fetch data langsung dari Firebase REST API
    url = f"{FIREBASE_DATABASE_URL}/latest_data.json"
    response = requests.get(url)
    
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/historical-data')
def get_historical_data():
    # Ambil data 24 jam terakhir
    url = f"{FIREBASE_DATABASE_URL}/sensor_data.json?orderBy=\"timestamp\"&limitToLast=100"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data:
            # Convert ke list untuk lebih mudah diproses frontend
            data_list = [{"key": key, **values} for key, values in data.items()]
            return jsonify(data_list)
        else:
            return jsonify([])
    else:
        return jsonify({"error": "Failed to fetch data"}), 500

if __name__ == '__main__':
    app.run(debug=True)