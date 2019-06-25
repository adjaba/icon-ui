import os
from flask import Flask, request, jsonify
import base64
import requests

app = Flask(__name__)

# @app.route("/")
# def home():
#     return "Hello, World!"

@app.route("/api/generate", methods=['POST'])
def sanity():
    content = request.json
    print(content)
    # print("HY", get_local_as_base64(content['img']))
    return jsonify(hello="world", hi="earth")

def get_local_as_base64(path):
    return base64.b64encode(path)

def get_url_as_base64(url):
    return base64.b64encode(requests.get(url).content)

if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host='127.0.0.1', port= os.environ.get('PORT', 3001), debug=True)