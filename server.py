from flask import Flask, request, jsonify, send_from_directory
import base64
import cv2
import numpy as np
import re

app = Flask(__name__, static_url_path='')

@app.route('/')
def index():
    return send_from_directory('', 'index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json['image']
    img_data = re.sub('^data:image/.+;base64,', '', data)
    img = base64.b64decode(img_data)
    nparr = np.frombuffer(img, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)

    colorfulness = float(np.std(image))
    edge_density = np.sum(edges > 0) / edges.size
    area = image.shape[0] * image.shape[1]

    result = {
        "攻撃力": int(edge_density * 100),
        "魔力": int(colorfulness),
        "体力": int(area / 1000)
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
