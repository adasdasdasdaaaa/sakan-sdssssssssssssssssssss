from flask import Flask, request, jsonify, send_from_directory
import numpy as np
import cv2
import os
import base64

app = Flask(__name__, static_folder='.')

# AIで能力をランダムに割り当てる（仮の処理）
def evaluate_image(image):
    h, w = image.shape[:2]
    avg_color = image.mean()
    strength = int(min(100, max(1, avg_color / 2)))
    speed = int(min(100, max(1, (255 - avg_color) / 2)))
    defense = int(min(100, max(1, (h + w) / 10)))
    return {
        "strength": strength,
        "speed": speed,
        "defense": defense
    }

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    if 'image' not in data:
        return jsonify({"error": "No image provided"}), 400

    image_data = data['image'].split(',')[1]
    image_bytes = base64.b64decode(image_data)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    stats = evaluate_image(img)
    return jsonify(stats)

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
