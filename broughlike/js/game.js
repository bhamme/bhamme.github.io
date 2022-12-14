function setupCanvas() {
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');
  if (shouldRotate()) {
    canvas.classList.add('rotate');
  }
  const { width, height } = gameDimensions();
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  ctx.imageSmoothingEnabled = false;

  attachTouchListeners();
}

const SPRITE_WIDTH = 16;

function drawSprite(sprite, x, y) {
  ctx.drawImage(
    spritesheet,
    sprite * SPRITE_WIDTH,
    0,
    SPRITE_WIDTH,
    SPRITE_WIDTH,
    x * tileSize + shakeX,
    y * tileSize + shakeY,
    tileSize,
    tileSize,
  )
}

function draw() {
  if (gameState === 'running' || gameState === 'dead') {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    screenshake();

    for (let i = 0; i < numTiles; i++) {
      for (let j = 0; j < numTiles; j++) {
        getTile(i, j).draw();
      }
    }
    for (let i = 0; i < monsters.length; i++) {
      monsters[i].draw();
    }
    player.draw();

    drawText("Level: " + level, 30, false, 40, "violet");
    drawText("Score: " + score, 30, false, 70, "violet");
  }
}

function tick() {
  for (let i = monsters.length - 1; i >= 0; i--) {
    if (!monsters[i].dead) {
      monsters[i].update();
    } else {
      monsters.splice(i, 1);
    }
  }
  if (player.dead) {
    addScore(score, false);
    gameState = 'dead';
  }

  spawnCountdown--;
  if (spawnCountdown <= 0) {
    spawnMonster();
    spawnCountdown = spawnRate;
    spawnRate--;
  }
}

function showTitle() {
  ctx.fillStyle = 'rgba(0,0,0,.75)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  gameState = 'title';

  drawText("SUPRE", 40, true, canvas.height / 2 - 110, 'white');
  drawText("BROUGH BROS", 70, true, canvas.height / 2 - 50, 'white');

  drawScores();
}

function startGame() {
  level = 1;
  score = 0;
  startLevel(startingHp);
  gameState = 'running';
}

function startLevel(playerHp) {
  spawnRate = 15;
  spawnCountdown = spawnRate;
  generateLevel();
  player = new Player(randomPassableTile());
  player.hp = playerHp;

  randomPassableTile().replace(Exit);
}

function drawText(text, size, centered, textY, color) {
  ctx.fillStyle = color;
  ctx.font = size + 'px monospace';
  let textX;
  if (centered) {
    textX = (canvas.width - ctx.measureText(text).width)/2;
  } else {
    textX = canvas.width - uiWidth * tileSize + 25;
  }
  ctx.fillText(text, textX, textY);
}

function getScores() {
  if (localStorage['scores']) {
    return JSON.parse(localStorage['scores']);
  } else {
    return [];
  }
}

function addScore(score, won) {
  let scores = getScores();
  let scoreObject = { score, run: 1, totalScore: score, active: won };
  let lastScore = scores.pop();

  if (lastScore) {
    if (lastScore.active) {
      scoreObject.run = lastScore.run + 1;
      scoreObject.totalScore += lastScore.totalScore;
    } else {
      scores.push(lastScore);
    }
  }
  scores.push(scoreObject);
  localStorage['scores'] = JSON.stringify(scores);
}

function drawScores() {
  let scores = getScores();
  if (scores.length) {
    drawText(
      rightPad(['RUN', 'SCORE', 'TOTAL']),
      18,
      true,
      canvas.height/2,
      'white'
    );

    let newestScore = scores.pop();
    scores.sort((a, b) => b.totalScore - a.totalScore);
    scores.unshift(newestScore);

    for (let i = 0; i < Math.min(10, scores.length); i++) {
      const { run, score, totalScore } = scores[i];
      let scoreText = rightPad([run, score, totalScore]);
      drawText(
        scoreText,
        18,
        true,
        canvas.height / 2 + (i + 1) * 24,
        i == 0 ? 'aqua' : 'violet',
      );
    }
  }
}

function screenshake() {
  if (shakeAmount) {
    shakeAmount --;
  }
  let shakeAngle = Math.random()*Math.PI*2;
  shakeX = Math.round(Math.cos(shakeAngle) * shakeAmount);
  shakeY = Math.round(Math.sin(shakeAngle) * shakeAmount);
}
