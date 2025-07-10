const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 400, y: 300, r: 10, speed: 3 };
let beast = { x: 100, y: 100, r: 15, speed: 1.5 };

let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

const scream = new Audio('static/scream.mp3');

function update() {
  if (keys['w']) player.y -= player.speed;
  if (keys['s']) player.y += player.speed;
  if (keys['a']) player.x -= player.speed;
  if (keys['d']) player.x += player.speed;

  // 野獣AI追尾
  let dx = player.x - beast.x;
  let dy = player.y - beast.y;
  let dist = Math.hypot(dx, dy);
  beast.x += (dx / dist) * beast.speed;
  beast.y += (dy / dist) * beast.speed;

  // 音量調整
  if (dist < 300) {
    scream.volume = 1 - (dist / 300);
    if (scream.paused) scream.play();
  } else {
    scream.pause();
    scream.currentTime = 0;
  }

  // 当たり判定
  if (dist < player.r + beast.r) {
    alert('野獣に捕まった！ゲームオーバー！');
    location.reload();
  }
}

function drawDarkness() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  let gradient = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, 100);
  gradient.addColorStop(0, 'rgba(0,0,0,1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawDarkness();
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(beast.x, beast.y, beast.r, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
