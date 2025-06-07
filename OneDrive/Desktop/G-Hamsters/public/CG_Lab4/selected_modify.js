function getScaledCoordinates(e) {
  const rect = canvasChild.getBoundingClientRect();
  const scaleX = CANVAS_WIDTH / rect.width;
  const scaleY = CANVAS_HEIGHT / rect.height;

  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);

  return { x, y };
}

canvasChild.addEventListener("dblclick", () => {
  if (ACTIVE_TOOL === "selector" && hasSelection) {
    SELECTED_EDITOR_ZONE = null;
    hasSelection = false;
    ctxChild.putImageData(CURRENT_VERSION_BASE, 0, 0);
    console.log("Виділення скинуто УРАА");
    ShowNotification("Область виділення знято");
  }
});

function drawSelection() {
  ctxChild.clearRect(0, 0, canvasChild.width, canvasChild.height);
  ctxChild.putImageData(CURRENT_VERSION_BASE, 0, 0);

  // Очищаємо канву для оновлення
  ctxChild.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctxChild.lineWidth = 4;
  ctxChild.setLineDash([8, 8]); // Пунктирна лінія
  ctxChild.strokeRect(
    SELECTED_EDITOR_ZONE.x1,
    SELECTED_EDITOR_ZONE.y1,
    SELECTED_EDITOR_ZONE.x2 - SELECTED_EDITOR_ZONE.x1,
    SELECTED_EDITOR_ZONE.y2 - SELECTED_EDITOR_ZONE.y1
  );
}


function drawSelectionBorder() {
 
  // Очищаємо канву для оновлення
  ctxChild.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctxChild.lineWidth = 4;
  ctxChild.setLineDash([5, 5]); // Пунктирна лінія
  ctxChild.strokeRect(
    SELECTED_EDITOR_ZONE.x1,
    SELECTED_EDITOR_ZONE.y1,
    SELECTED_EDITOR_ZONE.x2 - SELECTED_EDITOR_ZONE.x1,
    SELECTED_EDITOR_ZONE.y2 - SELECTED_EDITOR_ZONE.y1
  );
}

function getImageDataFromBase(x, y, width, height) {
  const imageData = ctxChild.createImageData(width, height);

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const srcIndex = ((y + row) * CURRENT_VERSION_BASE.width + (x + col)) * 4;
      const dstIndex = (row * width + col) * 4;

      imageData.data[dstIndex] = CURRENT_VERSION_BASE.data[srcIndex];
      imageData.data[dstIndex + 1] = CURRENT_VERSION_BASE.data[srcIndex + 1];
      imageData.data[dstIndex + 2] = CURRENT_VERSION_BASE.data[srcIndex + 2];
      imageData.data[dstIndex + 3] = CURRENT_VERSION_BASE.data[srcIndex + 3];
    }
  }

  return imageData;
}



function changeColorInSelection() {
  if (!SELECTED_EDITOR_ZONE) return;

  const { x1, y1, x2, y2 } = SELECTED_EDITOR_ZONE;
  const width = x2 - x1;
  const height = y2 - y1;

  const base = CURRENT_VERSION_BASE;
  //const base = ctxChild.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const fullCopy = new ImageData(
    new Uint8ClampedArray(base.data),
    base.width,
    base.height
  );
  const index = (x, y) => (y * base.width + x) * 4;

  const w = Math.floor(width);
const h = Math.floor(height);
const subImage = ctxChild.createImageData(w, h);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = index(x1 + x, y1 + y);
      const dstIdx = (y * width + x) * 4;

      // копіювання з поточної версії CURRENT
      for (let i = 0; i < 4; i++) {
        subImage.data[dstIdx + i] = base.data[srcIdx + i];
      }
    }
  }

  // Редагуємо тільки потрібну частину
  convertC1ToC2_Part(subImage);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = index(x1 + x, y1 + y);

      for (let i = 0; i < 4; i++) {
        fullCopy.data[dstIdx + i] = subImage.data[srcIdx + i];
      }
    }
  }

 

  ctxChild.putImageData(fullCopy, 0, 0);
  
  //tempVersion = null;

  //  const x1 = Math.min(SELECTED_EDITOR_ZONE.x1, SELECTED_EDITOR_ZONE.x2);
  //   const y1 = Math.min(SELECTED_EDITOR_ZONE.y1, SELECTED_EDITOR_ZONE.y2);
  //   const width = Math.abs(SELECTED_EDITOR_ZONE.x2 - SELECTED_EDITOR_ZONE.x1);
  //   const height = Math.abs(SELECTED_EDITOR_ZONE.y2 - SELECTED_EDITOR_ZONE.y1);

  //const fragment = getImageDataFromBase(x1, y1, width, height);

  //convertC1ToC2_Part(fragment); // Твоя обробка

  //ctxChild.putImageData(fragment, x1, y1); // Вставляємо результат
}

function convertC1ToC2_Part(imageData) {
  const fromSelect = document.getElementById("fromSelect");
  const toSelect = document.getElementById("toSelect");

  const key = `${fromSelect.value}->${toSelect.value}`;
  const action = conversionActions[key];
  if (!action) {
    console.warn("Непідтримувана конверсія");
    return;
  }

  action(imageData);

  CompareColorsPercantage();
  ShowNotification("Зображення перетворено!");
}

function activateTool(tool) {
  // Видаляємо клас активності з усіх кнопок
  document.querySelectorAll(".tool-button").forEach((button) => {
    button.classList.remove("active");
  });

  // Додаємо клас активності до поточної кнопки
  document.getElementById(`${tool}-tool`).classList.add("active");

  ACTIVE_TOOL = tool;

  if (tool == "selector") {
    IS_PART_EDIT = true;
  } else {
    IS_PART_EDIT = false;
  }

  console.log(`${tool} активовано`);
}
