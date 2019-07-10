import os
from flask import Flask, request, jsonify
import flask
import base64
import requests
import json
import re

app = Flask(__name__)

"""
Expected input: 
{
    'b64': base 64 256 by 256 image
    'input_n_style': number of samples per texture
    'input_do_gdwct': boolean (no/game style transfer)
    'input_alpha': float between 0 and 2
    'input_categories': list of texture strings
}
"""
@app.route("/api/generate", methods=['POST'])
def sanity():
    content = request.json

    IP = "172.20.79.104"
    PORT = 8501
    MODEL_NAME = "tsgan_gdwct_v2"

    endpoint = "http://%s:%d/v1/models/%s:predict" % (IP, PORT, MODEL_NAME)

    r = requests.post(endpoint, data = json.dumps(content))
    return jsonify(r.text)

"""
from https://github.com/runarfu/cors-proxy/master/server.py
"""
method_request_mapping = {
    'GET': requests.get,
    'POST': requests.post,
    'PUT': requests.put,
    'DELETE': requests.delete,
    'PATCH': requests.patch,
    'OPTIONS': requests.options,
}

@app.route('/api/proxy/<path:url>', methods = method_request_mapping.keys())
def proxy(url):
    requests_function = method_request_mapping[flask.request.method]
    request = requests_function(url, stream=True, params = flask.request.args)
    response = flask.Response(flask.stream_with_context(request.iter_content()), content_type=request.headers['content-type'], status=request.status_code)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host='0.0.0.0', port= os.environ.get('PORT', 3001), debug=True)