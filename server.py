from flask import Flask, render_template, send_from_directory, request, jsonify
from flask_socketio import SocketIO, emit
import numpy as np
import cv2
import base64
import os

app = Flask(__name__, static_folder='.')
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

players = {}

def evaluate_image(image):
    avg = image.mean()
    return {
        'strength': int(avg % 100),
        'speed': int((255 - avg) % 100),
        'defense': int((image.shape[0] + image.shape[1]) % 100)
    }

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    image_data = data['image'].split(',')[1]
    image_bytes = base64.b64decode(image_data)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    stats = evaluate_image(img)
    return jsonify(stats)

@socketio.on('join')
def handle_join(data):
    sid = request.sid
    players[sid] = data
    if len(players) == 2:
        p1, p2 = list(players.values())
        socketio.emit('start_battle', {'p1': p1, 'p2': p2})
        players.clear()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    socketio.run(app, host='0.0.0.0', port=port)
