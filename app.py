
from flask import Flask, render_template, jsonify, request
from decimal import Decimal
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
            def get_from_path(data, path, f):
                """Helper function to navigate through the nested dictionary."""
                keys = path.split('.')
                for key in keys:
                    if data is not None and key in data:
                        data = data[key]
                    else:
                        return None  # or a default value
                print(data)
                return f(data)
    
            extracted_data = {}
            for path in attribute_paths:
                key = path[1]  # Extract the last key as the attribute name
                extracted_data[key] = get_from_path(json_data, path[0], path[2])
            return extracted_data

        # all data must be sent as a string that represents a decimal/int with no special chars besides a '.' but 
        attribute_paths = [

            ("item.data.price","price", lambda a : a),
            # ("item.data.price","price", lambda a : a.replace("$","")),
            ("item.name","name", lambda a : a),
            ("item.market_cap_rank","market_cap_rank", lambda a : str(a)),
            ("item.data.total_volume","total_volume", lambda a : a.replace("$", "").replace(",", "")),
            ("item.score","score", lambda a : str(a)),
            ("item.data.price_change_percentage_24h.usd","price_change_percentage", lambda a : str(a)),
            ("item.large", "logo", lambda a : a) # cool to use the logo to prsent these
        ]
        extracted_data = extract_nested_attributes(coin, attribute_paths)
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
    url = f"https://api.coingecko.com/api/v3/search?query={query_param}"
    headers = {'accept': 'application/json'}
    
    # Make the API call
    data = {}
    try:
        response = requests.get(url, headers=headers)
        # Assuming the API returns JSON
        data = response.json()
        
        # Return the data from the API call
    except requests.RequestException as e:
        # Handle connection errors
        return jsonify({"error": "Failed to make API call", "details": str(e)}), 500
    def extract_coin(coin):
        def extract_nested_attributes(json_data, attribute_paths):
            def get_from_path(data, path, f):
                """Helper function to navigate through the nested dictionary."""
                keys = path.split('.')
                for key in keys:
                    if data is not None: 
                        data = data[key]
                    else:
                        return None  # or a default value
                return f(data)
    
            extracted_data = {}
            for path in attribute_paths:
                key = path[1]  # Extract the last key as the attribute name
                extracted_data[key] = get_from_path(json_data, path[0], path[2])
            return extracted_data

        # all data must be sent as a string that represents a decimal/int with no special chars besides a '.' but 

        # attribute_paths = [
        #     ("item.data.price","price", lambda a : a.replace("$","")),
        #     ("item.name","name", lambda a : a),
        #     ("item.market_cap_rank","market_cap_rank", lambda a : str(a)),
        #     ("item.data.total_volume","total_volume", lambda a : a.replace("$", "").replace(",", "")),
        #     ("item.score","score", lambda a : str(a)),
        #     ("item.data.price_change_percentage_24h.usd","price_change_percentage", lambda a : str(a)),
        #     ("item.large", "logo", lambda a : a) # cool to use the logo to prsent these
        # ]

        attribute_paths= [
            ("market_data.current_price.usd","price", lambda a : a),
            ("name","name", lambda a : a),
            ("market_cap_rank","market_cap_rank", lambda a : a),
            ("market_data.total_volume.usd","total_volume", lambda a : a),
            ("market_data.price_change_24h","score", lambda a : 0),
            ("market_data.price_change_percentage_24h","price_change_percentage", lambda a : a),
            ("image.large", "logo", lambda a : a) # cool to use the logo to prsent these
        ]

        extracted_data = extract_nested_attributes(coin, attribute_paths)
        return extracted_data
    final = []

    data = [{"id": obj["id"]} for obj in data["coins"]][:1]
    
    def get_precise_data(coin):

        url = f"https://api.coingecko.com/api/v3/coins/{coin}?market_data=true"
        headers = {'accept': 'application/json'}
    
        # Make the API call
        data = {}
        try:
            response = requests.get(url, headers=headers)
            # Assuming the API returns JSON
            data = response.json()
        
            # Return the data from the API call
        except requests.RequestException as e:
        # Handle connection errors
            return jsonify({"error": "Failed to make API call", "details": str(e)}), 500
        print(data)
        return data

    for item in data:
        final += [extract_coin(get_precise_data(item["id"]))]
    
    

    return final

    


@app.route('/graph')
def graph_runner():
    return render_template('graph.html')

@app.route('/main-page')
def main_site():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
