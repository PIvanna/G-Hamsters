document.getElementById("go-back").addEventListener("click", () => {
  window.location.href = "../main.html"; // ← заміни на потрібний файл
});

const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

let level = 1;
let lines = 0;
let score = 0;

const player = {
  shape: null,
  shapeName: null, 
  transform: translationMatrix(3, 0),
};

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const levelDisplay = document.getElementById("levelDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const gameOverDiv = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isPaused = true;

const colors = [
  null,
  "#FF0D72", 
  "#0DC2FF", 
  "#0DFF72", 
  "#F538FF",
  "#FF8E0D", 
  "#FFE138",
  "#3877FF", 
  "#AA00FF", 
  "#00FFAA", 
  "#FF0077", 
  "#77FF00",
  "#0077FF", 
];

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0],
  ],
  O: [
    [4, 4],
    [4, 4],
  ],
  S: [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0],
  ],
  Z: [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0],
  ],
  U: [ 
    [8, 0, 8],
    [8, 8, 8],
    [0, 0, 0],
  ],
  P: [ 
    [9, 9, 0], 
    [9, 9, 0],
    [9, 0, 0],
  ],
  W: [
    [0,10,10],
    [10,10,0],
    [0, 0, 0],
  ],
  Q: [  
    [11,11,0],
    [0,11,11],
    [0, 0, 0],
  ],
  V: [
    [12,0,0],
    [12,0,0],
    [12,12,12],
  ],
};

const arena = createMatrix(COLS, ROWS);

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(
          (x + offset.x) * BLOCK_SIZE,
          (y + offset.y) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
        ctx.strokeStyle = "#111";
        ctx.strokeRect(
          (x + offset.x) * BLOCK_SIZE,
          (y + offset.y) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    });
  });
}

function drawTransformedShape(points, transform) {
  points.forEach(({ x, y, value }) => {
    const [tx, ty] = multiplyMatrixAndPoint(transform, [x, y]);
    ctx.fillStyle = colors[value];
    ctx.fillRect(tx * BLOCK_SIZE, ty * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(tx * BLOCK_SIZE, ty * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  });
}

function shapeToPoints(matrix) {
  const points = [];
  matrix.forEach((row, y) =>
    row.forEach((val, x) => val && points.push({ x, y, value: val }))
  );
  return points;
}

function collideTransformed(shape, transform) {
  const points = shapeToPoints(shape);
  for (const point of points) {
    const [x, y] = multiplyMatrixAndPoint(transform, [point.x, point.y]);
    const xi = Math.floor(x + 0.00001); 
    const yi = Math.floor(y + 0.00001);

    if (
      yi < 0 || 
      yi >= arena.length || 
      xi < 0 || 
      xi >= arena[0].length ||
      (arena[yi] && arena[yi][xi] !== 0) 
    ) {
      return true;
    }
  }
  return false;
}

function mergeTransformed(arena, shape, transform) {
  const points = shapeToPoints(shape);
  for (const point of points) {
    const [x, y] = multiplyMatrixAndPoint(transform, [point.x, point.y]);
    const xi = Math.floor(x + 0.00001); 
    const yi = Math.floor(y + 0.00001); 
    if (yi >= 0 && yi < arena.length && xi >= 0 && xi < arena[0].length) {
      arena[yi][xi] = point.value;
    } else {
    }
  }
}


function playerMove(dx, dy) {
  const move = translationMatrix(dx, dy);
  const newTransform = multiplyMatrices(move, player.transform);
  if (!collideTransformed(player.shape, newTransform))
    player.transform = newTransform;
}

function playerRotate() {
  if (!player.shape || player.shapeName === 'O') { 
    return;
  }

  const points = shapeToPoints(player.shape);
  if (points.length === 0) return;

  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  const toOrigin = translationMatrix(-centerX, -centerY);
  const rotM = rotationMatrix(Math.PI / 2); 
  const back = translationMatrix(centerX, centerY);
  const localRotationMatrix = multiplyMatrices(back, multiplyMatrices(rotM, toOrigin));

  const rotatedTransformUnsnapped = multiplyMatrices(player.transform, localRotationMatrix);

  const currentWorldXofOrigin = rotatedTransformUnsnapped[2];
  const currentWorldYofOrigin = rotatedTransformUnsnapped[5];

  const snappedWorldXofOrigin = Math.round(currentWorldXofOrigin);
  const snappedWorldYofOrigin = Math.round(currentWorldYofOrigin);

  const dxAdjust = snappedWorldXofOrigin - currentWorldXofOrigin;
  const dyAdjust = snappedWorldYofOrigin - currentWorldYofOrigin;

  let baseSnappedRotatedTransform;
  if (Math.abs(dxAdjust) > 1e-5 || Math.abs(dyAdjust) > 1e-5) {
    const snapAdjustmentMatrix = translationMatrix(dxAdjust, dyAdjust);
    baseSnappedRotatedTransform = multiplyMatrices(snapAdjustmentMatrix, rotatedTransformUnsnapped);
  } else {
    baseSnappedRotatedTransform = rotatedTransformUnsnapped; 
  }

  const kicks = [
    [0, 0],   
    [1, 0],  
    [-1, 0],  
    [2, 0],   
    [-2, 0],  
  ];

  for (const [kickX, kickY] of kicks) {
    let finalTestTransform;
    if (kickX === 0 && kickY === 0) {
      finalTestTransform = baseSnappedRotatedTransform; 
    } else {
      const kickTranslationMatrix = translationMatrix(kickX, kickY);
      finalTestTransform = multiplyMatrices(kickTranslationMatrix, baseSnappedRotatedTransform);
    }

    if (!collideTransformed(player.shape, finalTestTransform)) {
      player.transform = finalTestTransform; 
      return;
    }
  }
}

function playerDrop() {
  const moved = translationMatrix(0, 1); 
  const newTransform = multiplyMatrices(moved, player.transform);

  if (!collideTransformed(player.shape, newTransform)) {
    player.transform = newTransform;
  } else {
    mergeTransformed(arena, player.shape, player.transform);
    playerReset(); 
    arenaSweep();
  }
  dropCounter = 0;
}

function playerReset() {
  const keys = Object.keys(SHAPES);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  player.shapeName = randomKey; 
  player.shape = SHAPES[randomKey];
  
  let shapeMatrixWidth = 0;
  if (player.shape && player.shape.length > 0 && player.shape[0]) {
    shapeMatrixWidth = player.shape[0].length;
  }
  const initialX = Math.floor(COLS / 2 - shapeMatrixWidth / 2);
  player.transform = translationMatrix(initialX, 0);

  if (collideTransformed(player.shape, player.transform)) {
    arena.forEach((row) => row.fill(0));
    isPaused = true;
    gameOverDiv.classList.remove("hidden");
    finalScore.textContent = score;
    setButtons("gameover");
  }
}

function arenaSweep() {
  let rowsClearedCount = 0;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) { 
        continue outer; 
      }
    }
    const clearedRow = arena.splice(y, 1)[0]; 
    arena.unshift(new Array(COLS).fill(0)); 
    
    rowsClearedCount++;
    lines++; 
    y++; 
  }

  if (rowsClearedCount > 0) {
    const pointsPerLine = [0, 40, 100, 300, 1200]; 
    score += (pointsPerLine[rowsClearedCount] || rowsClearedCount * 1200) * level;

    if (Math.floor(lines / 10) > level -1 ) { 
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100); 
    }
  }
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });

  if (player.shape) {
    const transformedPoints = shapeToPoints(player.shape);
    drawTransformedShape(transformedPoints, player.transform);
  }

  levelDisplay.textContent = level;
  scoreDisplay.textContent = score;
}


function update(time = 0) {
  if (isPaused) {
    return;
  }

  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function setButtons(state) {
  startBtn.disabled = state === "running" || state === "gameover";
  pauseBtn.disabled = state === "paused" || state === "gameover";
  resetBtn.disabled = false; 

  if (state === "gameover") {
    startBtn.textContent = "Start"; 
  } else if (state === "paused") {
     startBtn.textContent = "Resume";
  } else { 
     startBtn.textContent = "Start"; 
  }
}



function translationMatrix(dx, dy) {
  return [1, 0, dx, 0, 1, dy, 0, 0, 1];
}

function rotationMatrix(angleInRadians) {
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}


function multiplyMatrices(A, B) {
  return [
    A[0] * B[0] + A[1] * B[3] + A[2] * B[6], 
    A[0] * B[1] + A[1] * B[4] + A[2] * B[7], 
    A[0] * B[2] + A[1] * B[5] + A[2] * B[8], 

    A[3] * B[0] + A[4] * B[3] + A[5] * B[6], 
    A[3] * B[1] + A[4] * B[4] + A[5] * B[7], 
    A[3] * B[2] + A[4] * B[5] + A[5] * B[8], 

    A[6] * B[0] + A[7] * B[3] + A[8] * B[6], 
    A[6] * B[1] + A[7] * B[4] + A[8] * B[7], 
    A[6] * B[2] + A[7] * B[5] + A[8] * B[8], 
  ];
}

function multiplyMatrixAndPoint(m, [x, y]) {
  return [
    m[0] * x + m[1] * y + m[2], 
    m[3] * x + m[4] * y + m[5]  
  ];
}


document.addEventListener("keydown", (e) => {
  if (isPaused && gameOverDiv.classList.contains("hidden")) {    
     if (e.key === "Escape") {
        if (isPaused) {
        } else {
        }
     }
     return;
  }
  if (gameOverDiv.classList.contains("hidden") === false) return; 

  if (e.key === "ArrowLeft") {
    playerMove(-1, 0);
    e.preventDefault();
  } else if (e.key === "ArrowRight") {
    playerMove(1, 0);
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    playerDrop();
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    playerRotate();
    e.preventDefault();
  } else if (e.key === " ") { 
    e.preventDefault();
  }
});

startBtn.addEventListener("click", () => {
  if (isPaused) { 
    isPaused = false;
    gameOverDiv.classList.add("hidden"); 
    if (lastTime === 0) { 
        playerReset(); 
    }
    lastTime = performance.now(); 
    update();
    setButtons("running");
  }
});

pauseBtn.addEventListener("click", () => {
  if (!isPaused) {
    isPaused = true;
    setButtons("paused");
  }
});

resetBtn.addEventListener("click", () => {
  arena.forEach((row) => row.fill(0));
  lines = 0;
  score = 0;
  level = 1;
  dropInterval = 1000;
  lastTime = 0; 
  
  player.shape = null; 

  gameOverDiv.classList.add("hidden");
  isPaused = true;
  setButtons("paused"); 
  draw(); 
});


setButtons("paused"); 
playerReset(); 
draw(); 