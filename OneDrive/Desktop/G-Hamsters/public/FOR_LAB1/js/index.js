var canvas = document.getElementById("canvas-board");
var c = canvas.getContext("2d");

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 1024;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

var CENTER_X = CANVAS_WIDTH / 2;
var CENTER_Y = CANVAS_HEIGHT / 2;

var STEP = 100;

// ОЧИЩЕННЯ КАНВИ
function ReDrawBoard() {
  c.clearRect(0, 0, canvas.width, canvas.height);
  drawCoordinateBoard();
}

function drawCoordinateBoard() {
  console.log("Draw coordinate board / STEP = " + STEP);
  c.clearRect(0, 0, canvas.width, canvas.height);

  // Клітинки
  c.globalAlpha = 0.25;
  c.strokeStyle = "#aaaaaa";
  c.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += STEP) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, canvas.height);
    c.stroke();
  }

  for (let y = canvas.height; y >= 0; y -= STEP) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(canvas.width, y);
    c.stroke();
  }

  // Осі
  c.globalAlpha = 0.5;
  c.strokeStyle = "black";
  c.lineWidth = 2;

  // Oсь X (знизу)
  c.beginPath();
  c.moveTo(0, canvas.height - 0.5); // трішки вище, щоб не зливалося
  c.lineTo(canvas.width, canvas.height - 0.5);
  c.stroke();

  // Oсь Y (зліва)
  c.beginPath();
  c.moveTo(0.5, 0);
  c.lineTo(0.5, canvas.height);
  c.stroke();

  // Стрілки
  c.beginPath();
  c.moveTo(canvas.width - 10, canvas.height - 5);
  c.lineTo(canvas.width, canvas.height);
  c.lineTo(canvas.width - 10, canvas.height + 5); // майже не видно — можна не малювати
  c.stroke();

  c.beginPath();
  c.moveTo(5, 10);
  c.lineTo(0, 0);
  c.lineTo(-5, 10);
  c.stroke();

  // Надписи
  c.globalAlpha = 1;
  c.font = "bold 16px Arial";
  c.fillStyle = "black";
  c.fillText("X", canvas.width - 15, canvas.height - 10);
  c.fillText("Y", 15, 15);

  // Поділки та цифри
  c.font = "12px Arial";
  c.textAlign = "center";
  c.textBaseline = "middle";

  // Поділки по X
  for (let x = STEP; x < canvas.width; x += STEP) {
    c.beginPath();
    c.moveTo(x, canvas.height - 5);
    c.lineTo(x, canvas.height + 5);
    c.stroke();
    c.fillText(x / STEP, x, canvas.height - 15);
  }

  // Поділки по Y
  for (let y = STEP; y < canvas.height; y += STEP) {
    c.beginPath();
    c.moveTo(-5, canvas.height - y);
    c.lineTo(5, canvas.height - y);
    c.stroke();
    c.fillText(y / STEP, 15, canvas.height - y);
  }

  // Нуль
  c.fillText("0", 10, canvas.height - 10);
}



drawCoordinateBoard();
c.globalAlpha = 1;