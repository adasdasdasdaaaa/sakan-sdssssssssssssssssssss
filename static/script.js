const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
const socket = io();

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mousemove', draw);

function draw(e) {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 5, 0, 2 * Math.PI);
  ctx.fill();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function submit() {
  const image = canvas.toDataURL('image/png');
  fetch('/evaluate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ image })
  }).then(res => res.json()).then(stats => {
    document.getElementById('stats').innerText = `⚔️ 能力値\n力:${stats.strength} 速:${stats.speed} 防:${stats.defense}`;
    socket.emit('join', stats);
  });
}

socket.on('start_battle', ({ p1, p2 }) => {
  const result = simulateBattle(p1, p2);
  document.getElementById('battleLog').innerText = result;
});

function simulateBattle(p1, p2) {
  const score1 = p1.strength + p1.speed + p1.defense;
  const score2 = p2.strength + p2.speed + p2.defense;
  if (score1 === score2) return '⚔️ 引き分け！';
  return score1 > score2 ? '🎉 あなたの勝ち！' : '😢 あなたの負け…';
}
