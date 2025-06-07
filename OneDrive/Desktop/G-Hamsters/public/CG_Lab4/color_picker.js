const display = document.getElementById("colorDisplay");

const magnifier = document.getElementById("magnifier");
magnifier.style.display = "none";
const mctx = magnifier.getContext("2d");

let currentColor = [0, 0, 0];
let modelIndex = 0;
const models = ["RGB", "CMY", "HSB", "XYZ", "Lab", "HSL"];

let SELECTED_EDITOR_ZONE = null; // Об'єкт для зберігання координат виділення
let isDragging = false;
let hasSelection = false;
var ACTIVE_TOOL = "picker";


canvasChild.addEventListener("mousedown", (e) => {
  if (ACTIVE_TOOL == "selector") {
    const { x, y } = getScaledCoordinates(e);
    SELECTED_EDITOR_ZONE = { x1: x, y1: y };
    isDragging = true;
    hasSelection = false; // Записуємо початкові координати
  console.log("Виділення з ....");
  }
});

canvasChild.addEventListener("mouseup", () => {
   if (ACTIVE_TOOL == "selector" && isDragging) {
    isDragging = false;
    hasSelection = true;
    console.log("...Виділення по");
    drawSelection();

   

  }
});

canvasChild.addEventListener("mousemove", (e) => {
 if(ACTIVE_TOOL=="selector"){
 if (ACTIVE_TOOL == "selector" && isDragging && SELECTED_EDITOR_ZONE) {
    if (SELECTED_EDITOR_ZONE) {
      const { x, y } = getScaledCoordinates(e);
      // Оновлюємо координати, коли миша рухається
      SELECTED_EDITOR_ZONE.x2 = x;
      SELECTED_EDITOR_ZONE.y2 = y;

      drawSelection(); // Оновлюємо область
    }
  } 

 }else {
    const rect = canvasChild.getBoundingClientRect();
    const scaleX = canvasChild.width / rect.width;
    const scaleY = canvasChild.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    magnifier.style.display = "block";
    magnifier.style.left = e.clientX + 20 + "px";
    magnifier.style.top = e.clientY - 60 + "px";

    const zoom = 6;
    const size = 7;
    const offset = Math.floor(size / 2);
    const imageData = ctxChild.getImageData(x - offset, y - offset, size, size);

    mctx.imageSmoothingEnabled = false;
    mctx.clearRect(0, 0, magnifier.width, magnifier.height);
    mctx.putImageData(imageData, 0, 0);
    mctx.drawImage(
      magnifier,
      0,
      0,
      size,
      size,
      0,
      0,
      magnifier.width,
      magnifier.height
    );

    const cellWidth = magnifier.width / size;
    const cellHeight = magnifier.height / size;

    mctx.strokeStyle = "white";
    mctx.lineWidth = 4;
    mctx.strokeRect(
      Math.floor(magnifier.width / 2 - cellWidth / 2),
      Math.floor(magnifier.height / 2 - cellHeight / 2),
      cellWidth - 1,
      cellHeight - 1
    );
  }
});

canvasChild.addEventListener("mouseleave", () => {
  if (ACTIVE_TOOL != "selector") {
    magnifier.style.display = "none";
  }
});

canvasChild.addEventListener("click", (e) => {
  if (ACTIVE_TOOL != "selector") {
    const rect = canvasChild.getBoundingClientRect();
    const scaleX = canvasChild.width / rect.width;
    const scaleY = canvasChild.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const data = ctxChild.getImageData(x, y, 1, 1).data;
    currentColor = [data[0], data[1], data[2]];
    modelIndex = 0;
    updateDisplay();
  }
});

display.addEventListener("click", (e) => {
  // Якщо утримується Ctrl при кліку — копіюємо значення
  if (e.ctrlKey) {
    const text = display.textContent;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Копійовано до буфера:", text);
        ShowNotification("Значення кольору скопійовано!");
        // Можна показати коротке повідомлення користувачу, якщо хочеш
      })
      .catch((err) => {
        console.error("Не вдалося скопіювати:", err);
        ShowNotification("Помилка копіювання:", err);
      });
  } else {
    // Змінюємо модель
    modelIndex = (modelIndex + 1) % models.length;
    updateDisplay();
  }
});

function updateDisplay() {
  const [r, g, b] = currentColor;
  display.style.backgroundColor = `rgb(${r},${g},${b})`;

  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  display.style.color = brightness < 128 ? "white" : "black";

  let text = "";
  switch (models[modelIndex]) {
    case "RGB":
      text = `RGB: ${r}, ${g}, ${b}`;
      break;
    case "CMY":
      const cmy = [255 - r, 255 - g, 255 - b];
      text = `CMY: ${cmy.join(", ")}`;
      break;
    case "HSB":
      const hsb = rgbToHsb(r, g, b);
      text = `HSB: ${Math.round(hsb[0])}°, ${Math.round(hsb[1])}%, ${Math.round(
        hsb[2]
      )}%`;
      break;
    case "XYZ":
      const [x, y, z] = rgbToXyz(r, g, b);
      text = `XYZ: ${(x * 100).toFixed(2)}, ${(y * 100).toFixed(2)}, ${(
        z * 100
      ).toFixed(2)}`;
      break;
    case "Lab":
      const [l, a, b_] = rgbToLab(r, g, b);
      text = `Lab: ${l.toFixed(2)}, ${a.toFixed(2)}, ${b_.toFixed(2)}`;
      break;
    case "HSL":
      const [h_, s_, l_] = rgbToHsl(r, g, b);
      text = `HSL: ${h_.toFixed(0)}°, ${s_.toFixed(2)}%, ${l_.toFixed(2)}%`;
    
    break;
  }

  display.textContent = text;
}
