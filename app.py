from flask import Flask, render_template
from flask import Flask, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def home():
    return 'Welcome to the CoinGecko Data Fetcher!'

@app.route('/fetch-coins')
def fetch_coins():
    url = 'https://api.coingecko.com/api/v3/coins/list?include_platform=true'
    headers = {'accept': 'application/json'}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to fetch data from CoinGecko"}), response.status_code
    
@app.route('/main-page')
def main_site():
    return render_template('graph.html')

if __name__ == '__main__':
    app.run(debug=True)

