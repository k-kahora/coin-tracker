from flask import Flask, render_template, jsonify, request
import requests
import functools

app = Flask(__name__)

@app.route('/')
def home():
    return 'Welcome to the CoinGecko Data Fetcher!'

@app.route('/trending')
def trending():
    url = 'https://api.coingecko.com/api/v3/search/trending'
    headers = {'accept': 'application/json'}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json() # NOTE only getting 10 data items at the moment
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to fetch data from CoinGecko"}), response.status_code

@app.route('/fetch-coins')
def fetch_coins():
    url = 'https://api.coingecko.com/api/v3/coins/list?include_platform=true'
    headers = {'accept': 'application/json'}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()[:10] # NOTE only getting 10 data items at the moment
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to fetch data from CoinGecko"}), response.status_code

@app.route('/clean-data')
def clean():
    url = 'https://api.coingecko.com/api/v3/search/trending'
    headers = {'accept': 'application/json'}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json() # NOTE only getting 10 data items at the moment
    else:
        return jsonify({"error": "Failed to fetch data from CoinGecko"}), response.status_code
    list_of_coins = data["coins"]
    
    # function to extrac the dimensions from the json api call return a list with one element which is the data 
    def extract_coin(coin):
        def extract_nested_attributes(json_data, attribute_paths):
            def get_from_path(data, path):
                """Helper function to navigate through the nested dictionary."""
                keys = path.split('.')
                for key in keys:
                    if data is not None and key in data:
                        data = data[key]
                    else:
                        return None  # or a default value
                return data
    
            extracted_data = {}
            for path in attribute_paths:
                key = path[1]  # Extract the last key as the attribute name
                extracted_data[key] = get_from_path(json_data, path[0])
            return extracted_data

        attribute_paths = [
            ("item.name","name"),
        ]
        extracted_data = extract_nested_attributes(coin, attribute_paths)
        print(extracted_data)
        return extracted_data
    final = []
    for coin in list_of_coins:
        final += [extract_coin(coin)]


    return jsonify(final)

    

@app.route('/dimensions', methods=['GET'])
def dimension():
    query_param = request.args.get('query', None)

    # Check if the query parameter is provided
    if not query_param:
        return jsonify({"error": "Missing query parameter"}), 400
    url = f"https://api.coingecko.com/api/v3/coins/{query_param}?tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false"
    headers = {'accept': 'application/json'}
    
    # Make the API call
    try:
        response = requests.get(url, headers=headers)
        # Assuming the API returns JSON
        data = response.json()
        
        # Return the data from the API call
        return jsonify(data)
    except requests.RequestException as e:
        # Handle connection errors
        return jsonify({"error": "Failed to make API call", "details": str(e)}), 500

@app.route('/main-page')
def main_site():
    return render_template('graph.html')

if __name__ == '__main__':
    app.run(debug=True)

