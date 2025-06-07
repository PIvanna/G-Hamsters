// Клас для роботи з канвасом
class CanvasManager {
  constructor(id, menuId) {
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext("2d");
    this.menu = document.getElementById(menuId);
    this.imageLoaded = false;
    this.clickListener = null;
    this.contextMenuListener = null;
    this.isDrawing = false;
    this.zoomCanvas = document.getElementById("zoomCanvas");
    this.pixelInfo = document.getElementById("pixelInfo");
    this.zoomCtx = this.zoomCanvas.getContext("2d");
    this.zoomSize = 5;
    this.imageHistory = []; // Array to store image states
    this.historyIndex = -1; // Current position in the history
    this.scale = 20;
    this.startX = 0;
    this.startY = 0;
    this.rectX = 0;
    this.rectY = 0;
    this.rectWidth = 0;
    this.rectHeight = 0;
    this.imageData = null;
    this.setupEvents();
    this.typeModel = "rgb";
    this.drawPlaceholder();
    this.image = null;
  }

  drawPlaceholder() {
    this.clear();
    this.canvas.title = `Тип моделі: ${this.typeModel.toUpperCase()}`; // <-- додано

    const lines = ["Поки немає зображення,", "натисніть, щоб обрати фото"];
    const lineHeight = 30;
    const startY = this.canvas.height / 2 - (lines.length * lineHeight) / 2;

    this.ctx.font = "24px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "center";

    lines.forEach((line, i) => {
      this.ctx.fillText(line, this.canvas.width / 2, startY + i * lineHeight);
    });
  }

  loadImage(file) {
    if (!file || this.imageLoaded) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        this.clear();
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        this.image = img;
        this.imageData = this.ctx.getImageData(
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
        this.imageLoaded = true;
        this.saveImageToHistory();
        checkOptions();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  saveImageToHistory() {
    // console.log("hi");
    if (this.imageHistory.length >= 10) {
      this.imageHistory.shift(); // Remove the oldest image to keep the history size to 10
    }
    this.imageHistory.push(this.imageData); // Add the current image to history
    this.historyIndex = this.imageHistory.length - 1; // Set current index to the last image
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreImageFromHistory();
    }
  }

  redo() {
    if (this.historyIndex < this.imageHistory.length - 1) {
      this.historyIndex++;
      this.restoreImageFromHistory();
    }
  }

  restoreImageFromHistory() {
    const imageData = this.imageHistory[this.historyIndex];
    this.clear();
    this.ctx.putImageData(imageData, 0, 0);
    this.imageData = imageData; // Update the current imageData
  }

  removeImage() {
    this.clear();
    this.drawPlaceholder();
    document.getElementById("imageInput").value = "";
    checkOptions();
    if (
      !(
        getComputedStyle(canvas1Manager.canvas).display == "none" ||
        getComputedStyle(canvas2Manager.canvas).display == "none"
      )
    ) {
      if (currentCanvasManager != this) {
        this.canvas.style.display = "none";
        this.imageLoaded = false;
      } else {
        currentCanvasManager.canvas.style.display = "none";
        currentCanvasManager.imageLoaded = false;
        currentCanvasManager =
          this === canvas1Manager ? canvas2Manager : canvas1Manager;
      }
    } else {
      currentCanvasManager.typeModel = "rgb";
      currentCanvasManager.updateTitle();
      currentCanvasManager.imageLoaded = false;
    }
    checkOptions();
    checkModel();
    resetMetrics();
    updateModificationForm();
    syncColorSelectsWithCurrentCanvas();
    toggleButtonsState(false);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  showMenu(e) {
    e.preventDefault();
    CanvasManager.hideAllMenus();
    this.menu.style.left = `${e.pageX}px`;
    this.menu.style.top = `${e.pageY}px`;
    this.menu.style.display = "block";
  }

  setupEvents() {
    this.clickListener = () => {
      if (this.imageLoaded) {
        alert(
          "Зображення вже завантажене! Щоб додати нове, спочатку видаліть поточне."
        );
      } else {
        document.getElementById("imageInput").click();
      }
    };

    this.contextMenuListener = (e) => this.showMenu(e);

    this.canvas.addEventListener("click", this.clickListener);
    this.canvas.addEventListener("contextmenu", this.contextMenuListener);

    this.canvas.addEventListener("mousedown", (e) => {
      if (!this.imageLoaded || this.typeModel !== "hsl") return; // Малюємо лише при типі hsl

      // Перевірка, чи натиснуто праву кнопку миші
      if (e.button !== 2) return;
      // Перевірка чи натиснуто Ctrl
      if (!e.ctrlKey) return;

      this.isDrawing = true;

      // Зберігаємо початкові координати
      this.startX = e.offsetX;
      this.startY = e.offsetY;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isDrawing) return;

      this.clear();

      if (this.imageData) {
        this.ctx.putImageData(this.imageData, 0, 0);
      }

      this.rectWidth = e.offsetX - this.startX;
      this.rectHeight = e.offsetY - this.startY;

      this.ctx.fillStyle = "rgba(128, 128, 128, 0.3)";
      this.ctx.fillRect(
        this.startX,
        this.startY,
        this.rectWidth,
        this.rectHeight
      );

      this.ctx.strokeStyle = "rgba(0, 0, 255, 0)"; // Прозора обводка
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        this.startX,
        this.startY,
        this.rectWidth,
        this.rectHeight
      );
    });

    this.canvas.addEventListener("mouseup", () => {
      if (!this.isDrawing) return;

      this.isDrawing = false;

      this.rectX = this.startX;
      this.rectY = this.startY;

      if (this.rectWidth < 0) {
        this.rectX += this.rectWidth;
        this.rectWidth = Math.abs(this.rectWidth);
      }
      if (this.rectHeight < 0) {
        this.rectY += this.rectHeight;
        this.rectHeight = Math.abs(this.rectHeight);
      }

      this.getImageDataForRectangle();
    });

    this.canvas.addEventListener("mouseout", () => {
      this.isDrawing = false;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.imageLoaded) return;

      const rect = this.canvas.getBoundingClientRect();
      const mouseX = Math.floor(e.clientX - rect.left);
      const mouseY = Math.floor(e.clientY - rect.top);

      this.updateMagnifier(mouseX, mouseY, e.pageX, e.pageY);
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.zoomCanvas.style.display = "none";
      this.pixelInfo.style.display = "none";
    });
  }

  updateMagnifier(mouseX, mouseY, pageX, pageY) {
    const startX = Math.max(0, mouseX - Math.floor(this.zoomSize / 2));
    const startY = Math.max(0, mouseY - Math.floor(this.zoomSize / 2));

    const imageData = this.ctx.getImageData(
      startX,
      startY,
      this.zoomSize,
      this.zoomSize
    );
    this.zoomCtx.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);

    for (let y = 0; y < this.zoomSize; y++) {
      for (let x = 0; x < this.zoomSize; x++) {
        const i = (y * this.zoomSize + x) * 4;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        this.zoomCtx.fillStyle = `rgb(${r},${g},${b})`;
        this.zoomCtx.fillRect(
          x * this.scale,
          y * this.scale,
          this.scale,
          this.scale
        );

        // Сіра сітка
        this.zoomCtx.strokeStyle = "gray";
        this.zoomCtx.strokeRect(
          x * this.scale,
          y * this.scale,
          this.scale,
          this.scale
        );
      }
    }

    // 🟥 Виділення центрального пікселя
    const center = Math.floor(this.zoomSize / 2);
    this.zoomCtx.strokeStyle = "red";
    this.zoomCtx.lineWidth = 2;
    this.zoomCtx.strokeRect(
      center * this.scale,
      center * this.scale,
      this.scale,
      this.scale
    );

    // Позиція zoomCanvas біля курсора
    this.zoomCanvas.style.display = "block";
    this.zoomCanvas.style.left = `${pageX + 10}px`;
    this.zoomCanvas.style.top = `${pageY + 10}px`;

    // Піксельна інформація
    const pixel = this.ctx.getImageData(mouseX, mouseY, 1, 1).data;
    let colorInfo = "";

    if (this.typeModel === "rgb") {
      colorInfo = `RGB: (${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    } else if (this.typeModel === "hsl") {
      const hsl = this.rgbToHsl(pixel[0], pixel[1], pixel[2]);
      colorInfo = `HSL: (${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`;
    } else if (this.typeModel === "cmyk") {
      const cmyk = this.rgbToCmyk(pixel[0], pixel[1], pixel[2]);
      colorInfo = `CMYK: (${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    }

    this.pixelInfo.innerText = `X: ${mouseX}, Y: ${mouseY}\n${colorInfo}`;
    this.pixelInfo.style.left = `${pageX + 220}px`;
    this.pixelInfo.style.top = `${pageY}px`;
    this.pixelInfo.style.display = "block";
  }

  getImageDataForRectangle() {
    if (this.rectWidth <= 0 || this.rectHeight <= 0) {
      console.error("Невірні розміри прямокутника.");
      return;
    }

    const imageData = this.ctx.getImageData(
      this.rectX,
      this.rectY,
      this.rectWidth,
      this.rectHeight
    );
    // console.log("Зібрані дані пікселів:", imageData);

    // Тепер можеш модифікувати imageData, якщо потрібно
  }

  static hideAllMenus() {
    document.querySelectorAll(".context-menu").forEach((menu) => {
      menu.style.display = "none";
    });
  }

  static hideAllMenus() {
    document.querySelectorAll(".context-menu").forEach((menu) => {
      menu.style.display = "none";
    });
  }

  download() {
    const link = document.createElement("a");
    link.download = `${this.canvas.id}.png`;
    link.href = this.canvas.toDataURL();
    link.click();
    CanvasManager.hideAllMenus();
  }

  updateTitle() {
    this.canvas.title = `Тип моделі: ${this.typeModel.toUpperCase()}`;
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // ахроматичний
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h *= 60;
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  rgbToCmyk(r, g, b) {
    const c = 1 - r / 255;
    const m = 1 - g / 255;
    const y = 1 - b / 255;
    const k = Math.min(c, m, y);

    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }

    return {
      c: Math.round(((c - k) / (1 - k)) * 100),
      m: Math.round(((m - k) / (1 - k)) * 100),
      y: Math.round(((y - k) / (1 - k)) * 100),
      k: Math.round(k * 100),
    };
  }
}

let canvas1Manager, canvas2Manager, currentCanvasManager;
const buttons = document.querySelectorAll(".tab-button");
const contents = document.querySelectorAll(".tab-content");
const fromSelect = document.getElementById("fromColor");
const toSelect = document.getElementById("toColor");
const attributeTab = document.querySelector("#attributes");
const hueStart = document.getElementById("hueStart");
const hueEnd = document.getElementById("hueEnd");
const saturation = document.getElementById("saturation");
const lightness = document.getElementById("lightness");

const saturationValue = document.getElementById("saturationValue");
const lightnessValue = document.getElementById("lightnessValue");

// Отримати всі слайдери
const hueStartSlider = document.getElementById("hueStart");
const hueEndSlider = document.getElementById("hueEnd");
const saturationSlider = document.getElementById("saturation");
const lightnessSlider = document.getElementById("lightness");

let startX,
  startY,
  isDrawing = false;

document
  .getElementById("applyHSL")
  .addEventListener("click", updateColorAttributes);

document.addEventListener("DOMContentLoaded", () => {
  canvas1Manager = new CanvasManager("canvas1", "menu1");
  canvas2Manager = new CanvasManager("canvas2", "menu2");
  currentCanvasManager = canvas1Manager;
  checkOptions();
  attributeTab.classList.add("disabled");
  attributeTab.setAttribute("title", "Заблоковано під час переведення кольору");
  attributeTab.style.pointerEvents = "none";
  attributeTab.style.opacity = "0.5";
  [hueStart, hueEnd, saturation, lightness].forEach((slider) => {
    slider.addEventListener("input", () => {
      updateDisplayValues();
      handleHSLChange();
    });
  });
  updateDisplayValues();
  handleHSLChange();
});

let hsl = {
  h: 0,
  s: 0,
  l: 0,
};

let cmyk = {
  c: 0,
  m: 0,
  y: 0,
  k: 0,
};

const converters = {
  rgb: {
    hsl: ([r, g, b]) => rgbToHsl(r, g, b),
    cmyk: ([r, g, b]) => rgbToCmyk(r, g, b),
    rgb: ([r, g, b]) => [r, g, b], // без змін
  },
  hsl: {
    rgb: ([h, s, l]) => hslToRgb(h, s, l),
    cmyk: ([h, s, l]) => rgbToCmyk(...hslToRgb(h, s, l)),
    hsl: ([h, s, l]) => [h, s, l],
  },
  cmyk: {
    rgb: ([c, m, y, k]) => cmykToRgb(c, m, y, k),
    hsl: ([c, m, y, k]) => rgbToHsl(...cmykToRgb(c, m, y, k)),
    cmyk: ([c, m, y, k]) => [c, m, y, k],
  },
};

const convertersModif = {
  rgb: {
    hsl: ([r, g, b]) => modifyColorRGBtoHSL(r, g, b, hsl),
    cmyk: ([r, g, b]) => rgbToCmykModif(r, g, b, cmyk),
    rgb: ([r, g, b]) => [r, g, b], // без змін
  },
  hsl: {
    rgb: ([h, s, l]) => hslToRgbModif(h, s, l, hsl),
    cmyk: ([h, s, l]) => rgbToCmykModif(...hslToRgbModif(h, s, l, hsl), cmyk),
    hsl: ([h, s, l]) => [h, s, l],
  },
  cmyk: {
    rgb: ([c, m, y, k]) => cmykToRgbModif(c, m, y, k, cmyk),
    hsl: ([c, m, y, k]) =>
      modifyColorRGBtoHSL(...cmykToRgbModif(c, m, y, k, cmyk), hsl),
    cmyk: ([c, m, y, k]) => [c, m, y, k],
  },
};

document.getElementById("prevButton").addEventListener("click", function () {
  currentCanvasManager.undo(); // Викликаємо метод navigate об'єкта
});

document.getElementById("nextButton").addEventListener("click", function () {
  currentCanvasManager.redo(); // Викликаємо метод navigate об'єкта
});

document.getElementById("saveButton").addEventListener("click", function () {
  currentCanvasManager.saveImageToHistory(); // Викликаємо метод navigate об'єкта
});
// Ініціалізація канвасів

function updateDisplayValues() {
  saturationValue.textContent = `${saturation.value}%`;
  lightnessValue.textContent = `${lightness.value}%`;
}

function handleHSLChange() {
  const hStart = parseInt(hueStart.value);
  const hEnd = parseInt(hueEnd.value);
  const s = parseInt(saturation.value);
  const l = parseInt(lightness.value);

  // Приклад — вивести в консоль
  // console.log(
  //   `Hue range: ${hStart}°–${hEnd}°, Saturation: ${s}%, Lightness: ${l}%`
  // );

  // TODO: оновити canvas, фільтр, фрагмент зображення тощо
  // Наприклад:
  // currentCanvasManager.updateHSL(hStart, hEnd, s, l);
}

function checkOptions() {
  if (!currentCanvasManager.imageLoaded) {
    fromSelect.disabled = true;
    toSelect.disabled = true;
  } else {
    toSelect.disabled = false;
  }
}

function checkModel() {
  const canvas1Visible =
    getComputedStyle(canvas1Manager.canvas).display !== "none";
  const canvas2Visible =
    getComputedStyle(canvas2Manager.canvas).display !== "none";

  let visibleCanvasManager = null;

  if (canvas1Visible && !canvas2Visible) {
    visibleCanvasManager = canvas1Manager;
  } else if (canvas2Visible && !canvas1Visible) {
    visibleCanvasManager = canvas2Manager;
  }

  if (visibleCanvasManager && visibleCanvasManager.typeModel === "hsl") {
    attributeTab.classList.remove("disabled");
    attributeTab.removeAttribute("title");
    attributeTab.style.pointerEvents = "auto";
    attributeTab.style.opacity = "1";
  } else {
    attributeTab.classList.add("disabled");
    attributeTab.setAttribute(
      "title",
      "Заблоковано під час переведення кольору"
    );
    attributeTab.style.pointerEvents = "none";
    attributeTab.style.opacity = "0.5";
  }
}

// Обробка вибору файлу
const imageInput = document.getElementById("imageInput");
imageInput.addEventListener("change", (e) => {
  currentCanvasManager.loadImage(e.target.files[0]);
});

// Перехід між канвасами
function navigateCanvas(id) {
  [canvas1Manager, canvas2Manager].forEach((manager) => {
    const isActive = manager.canvas.id === id;
    manager.canvas.style.display = isActive ? "block" : "none";
    if (isActive) currentCanvasManager = manager;
  });
  CanvasManager.hideAllMenus();
  checkOptions();
  checkModel();
  resetMetrics();
  updateModificationForm();
  syncColorSelectsWithCurrentCanvas();
  toggleButtonsState(false);
}

// Очищення
function clearCanvas(id) {
  if (canvas1Manager.canvas.id === id) canvas1Manager.removeImage();
  else if (canvas2Manager.canvas.id === id) canvas2Manager.removeImage();
  CanvasManager.hideAllMenus();
}

// Завантаження
function downloadCanvas(id) {
  if (canvas1Manager.canvas.id === id) canvas1Manager.download();
  else if (canvas2Manager.canvas.id === id) canvas2Manager.download();
  CanvasManager.hideAllMenus();
}

// Приховати меню при кліку десь поза ним
document.addEventListener("click", CanvasManager.hideAllMenus);

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    contents.forEach((c) => c.classList.add("hidden"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.remove("hidden");
  });
});

function syncColorSelectsWithCurrentCanvas() {
  const currentType = currentCanvasManager.typeModel;
  fromSelect.value = currentType;
  toSelect.value = currentType;

  // Оновити доступність опцій
  Array.from(toSelect.options).forEach((opt) => {
    opt.disabled = opt.value === currentType;
  });
}

function updateSelectOptions() {
  const fromValue = fromSelect.value;
  const toValue = toSelect.value;

  canvas1Manager.typeModel = fromValue;
  canvas2Manager.typeModel = toValue;

  canvas1Manager.updateTitle();
  canvas2Manager.updateTitle();

  // Заборонити вибір однакових значень
  Array.from(toSelect.options).forEach((opt) => {
    opt.disabled = opt.value === fromValue;
  });

  // Якщо вибрано однакові значення, вибираємо перший доступний
  if (toValue === fromValue) {
    // Змінюємо вибір на перший варіант, який не заблокований
    toSelect.selectedIndex = Array.from(toSelect.options).findIndex(
      (opt) => !opt.disabled
    );
    // Оновлюємо функцію ще раз

    updateSelectOptions();
    return;
  }

  // Показати другу канву
  openTwoCanvas();
  convertCanvas();

  updateModificationForm();

  // Заборонити перехід до вкладки "Атрибути"
}

// Додаємо обробник події на зміну select
fromSelect.addEventListener("change", updateSelectOptions);
toSelect.addEventListener("change", updateSelectOptions);

// Викликаємо функцію для первинного налаштування

fromSelect.addEventListener("change", updateSelectOptions);

function openTwoCanvas() {
  document.getElementById("canvas2").style.display = "block";
  document.getElementById("canvas1").style.display = "block";
}

function calculateAverageColor(imageData) {
  const data = imageData.data;
  let totalR = 0,
    totalG = 0,
    totalB = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
  }

  return [totalR / pixelCount, totalG / pixelCount, totalB / pixelCount];
}

// Calculate luminance for SSIM
function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Update histogram buckets
function updateHist(hist, r, g, b) {
  hist.r[r]++;
  hist.g[g]++;
  hist.b[b]++;
}

// Compute average color from totals
function computeAverage(totalR, totalG, totalB, count) {
  return {
    r: totalR / count,
    g: totalG / count,
    b: totalB / count,
  };
}

// Compute RMS Error
function computeRMS(sumSqError, pixelCount) {
  return Math.sqrt(sumSqError / (pixelCount * 3));
}

// Compute PSNR
function computePSNR(mse, maxVal = 255) {
  return 20 * Math.log10(maxVal / Math.sqrt(mse));
}

// Compute SSIM (luminance-only)
function computeSSIM(
  sumOrigY,
  sumNewY,
  sumOrigY2,
  sumNewY2,
  sumOrigNew,
  pixelCount
) {
  const K1 = 0.01,
    K2 = 0.03,
    L = 255;
  const C1 = (K1 * L) ** 2;
  const C2 = (K2 * L) ** 2;

  const muX = sumOrigY / pixelCount;
  const muY = sumNewY / pixelCount;
  const sigmaX2 = sumOrigY2 / pixelCount - muX * muX;
  const sigmaY2 = sumNewY2 / pixelCount - muY * muY;
  const sigmaXY = sumOrigNew / pixelCount - muX * muY;

  return (
    ((2 * muX * muY + C1) * (2 * sigmaXY + C2)) /
    ((muX * muX + muY * muY + C1) * (sigmaX2 + sigmaY2 + C2))
  );
}

function showMetrics(metrics) {
  document.getElementById(
    "avgOrig"
  ).textContent = `R=${metrics.avgOrig.r.toFixed(
    2
  )}, G=${metrics.avgOrig.g.toFixed(2)}, B=${metrics.avgOrig.b.toFixed(2)}`;
  document.getElementById("avgNew").textContent = `R=${metrics.avgNew.r.toFixed(
    2
  )}, G=${metrics.avgNew.g.toFixed(2)}, B=${metrics.avgNew.b.toFixed(2)}`;
  document.getElementById("mse").textContent = metrics.mse;
  document.getElementById("rms").textContent = metrics.rms;
  document.getElementById("psnr").textContent = metrics.psnr.toFixed(2) + " dB";
  document.getElementById("ssim").textContent = metrics.ssim.toFixed(4);
  document.getElementById(
    "histDiff"
  ).textContent = `R=${metrics.histDiff.r}, G=${metrics.histDiff.g}, B=${metrics.histDiff.b}`;
  document.getElementById("changed").textContent = metrics.changed
    ? "так"
    : "ні";
}

function resetMetrics() {
  document.getElementById("avgOrig").textContent = "R=0, G=0, B=0";
  document.getElementById("avgNew").textContent = "R=0, G=0, B=0";
  document.getElementById("mse").textContent = "0";
  document.getElementById("rms").textContent = "0";
  document.getElementById("psnr").textContent = "0 dB";
  document.getElementById("ssim").textContent = "0";
  document.getElementById("histDiff").textContent = "R=0, G=0, B=0";
  document.getElementById("changed").textContent = "ні";
}

// Main conversion with metrics
function convertCanvas() {
  const sourceCtx = currentCanvasManager.ctx;
  const sourceCanvas = currentCanvasManager.canvas;

  const fromModel = fromSelect.value;
  const toModel = toSelect.value;

  const imageData = sourceCtx.getImageData(
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height
  );
  const data = imageData.data;
  const newImageData = sourceCtx.createImageData(imageData);
  const newData = newImageData.data;

  // Initialize accumulators
  let totalOrig = { r: 0, g: 0, b: 0 }; // визначення середніх значень
  let totalNew = { r: 0, g: 0, b: 0 };
  let sumSqError = 0; // MSE (Mean Squared Error):
  let sumOrigY = 0,
    sumNewY = 0,
    sumOrigY2 = 0,
    sumNewY2 = 0,
    sumOrigNew = 0;

  const pixelCount = data.length / 4;
  const origHist = {
    r: Array(256).fill(0),
    g: Array(256).fill(0),
    b: Array(256).fill(0),
  };
  const newHist = {
    r: Array(256).fill(0),
    g: Array(256).fill(0),
    b: Array(256).fill(0),
  };

  let changeDetected = false;
  const epsilon = 1e-16;

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3];

    // Track original
    totalOrig.r += r;
    totalOrig.g += g;
    totalOrig.b += b;
    updateHist(origHist, r, g, b);

    const origY = luminance(r, g, b);
    sumOrigY += origY;
    sumOrigY2 += origY * origY;

    // Convert color
    let fromColor =
      fromModel === "rgb"
        ? [r, g, b]
        : fromModel === "hsl"
        ? rgbToHsl(r, g, b)
        : rgbToCmyk(r, g, b);
    const toColor = converters[fromModel][toModel](fromColor);
    let [nr, ng, nb] =
      toModel === "rgb"
        ? toColor
        : toModel === "hsl"
        ? hslToRgb(...toColor)
        : cmykToRgb(...toColor);

    // Detect any change
    if (
      !changeDetected &&
      (Math.abs(nr - r) > epsilon ||
        Math.abs(ng - g) > epsilon ||
        Math.abs(nb - b) > epsilon)
    ) {
      changeDetected = true;
      console.log("Change detected at pixel", i / 4);
    }

    // Track new
    totalNew.r += nr;
    totalNew.g += ng;
    totalNew.b += nb;
    const newY = luminance(nr, ng, nb);
    sumNewY += newY;
    sumNewY2 += newY * newY;
    sumOrigNew += origY * newY;

    sumSqError += (nr - r) ** 2 + (ng - g) ** 2 + (nb - b) ** 2; // MSE (Mean Squared Error):

    // Write out
    newData[i] = Math.round(nr);
    newData[i + 1] = Math.round(ng);
    newData[i + 2] = Math.round(nb);
    newData[i + 3] = a;

    updateHist(newHist, Math.round(nr), Math.round(ng), Math.round(nb));
  }

  // Draw canvases
  canvas1Manager.ctx.putImageData(imageData, 0, 0);
  canvas2Manager.ctx.putImageData(newImageData, 0, 0);
  canvas1Manager.typeModel = fromModel;
  canvas2Manager.typeModel = toModel;
  canvas1Manager.updateTitle();
  canvas2Manager.updateTitle();
  canvas1Manager.imageLoaded = canvas2Manager.imageLoaded = true;
  canvas1Manager.imageData = canvas1Manager.ctx.getImageData(
    0,
    0,
    canvas1Manager.canvas.width,
    canvas1Manager.canvas.height
  );
  canvas2Manager.imageData = canvas2Manager.ctx.getImageData(
    0,
    0,
    canvas2Manager.canvas.width,
    canvas2Manager.canvas.height
  );

  canvas1Manager.saveImageToHistory();
  canvas2Manager.saveImageToHistory();

  // Compute metrics
  const avgOrig = computeAverage(
    totalOrig.r,
    totalOrig.g,
    totalOrig.b,
    pixelCount
  );
  const avgNew = computeAverage(totalNew.r, totalNew.g, totalNew.b, pixelCount);

  const rms = computeRMS(sumSqError, pixelCount);
  const mse = sumSqError / (pixelCount * 3);// MSE (Mean Squared Error):
  const psnr = computePSNR(mse);

  const ssim = computeSSIM(
    sumOrigY,
    sumNewY,
    sumOrigY2,
    sumNewY2,
    sumOrigNew,
    pixelCount
  );

  // Histogram difference
  const diffHist = { r: 0, g: 0, b: 0 };
  for (let v = 0; v < 256; v++) {
    diffHist.r += Math.abs(origHist.r[v] - newHist.r[v]);
    diffHist.g += Math.abs(origHist.g[v] - newHist.g[v]);
    diffHist.b += Math.abs(origHist.b[v] - newHist.b[v]);
  }

  showMetrics({
    avgOrig,
    avgNew,
    mse,
    rms,
    psnr,
    ssim,
    histDiff: diffHist,
    changed: changeDetected,
  });

  toggleButtonsState(true);
}

function convertCanvasModif() {
  const sourceCtx = currentCanvasManager.ctx;
  const sourceCanvas = currentCanvasManager.canvas;

  const fromModel = fromSelect.value;
  const toModel = toSelect.value;
  if (!convertCanvasModifData()) return;
  const imageData = sourceCtx.getImageData(
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height
  );
  const data = imageData.data;
  const newImageData = sourceCtx.createImageData(imageData);
  const newData = newImageData.data;

  // Initialize accumulators
  let totalOrig = { r: 0, g: 0, b: 0 };
  let totalNew = { r: 0, g: 0, b: 0 };
  let sumSqError = 0;
  let sumOrigY = 0,
    sumNewY = 0,
    sumOrigY2 = 0,
    sumNewY2 = 0,
    sumOrigNew = 0;

  const pixelCount = data.length / 4;
  const origHist = {
    r: Array(256).fill(0),
    g: Array(256).fill(0),
    b: Array(256).fill(0),
  };
  const newHist = {
    r: Array(256).fill(0),
    g: Array(256).fill(0),
    b: Array(256).fill(0),
  };

  let changeDetected = false;
  const epsilon = 1e-16;

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3];

    // Track original
    totalOrig.r += r;
    totalOrig.g += g;
    totalOrig.b += b;
    updateHist(origHist, r, g, b);

    const origY = luminance(r, g, b);
    sumOrigY += origY;
    sumOrigY2 += origY * origY;

    let fromColor =
      fromModel === "rgb"
        ? [r, g, b]
        : fromModel === "hsl"
        ? modifyColorRGBtoHSL(r, g, b, hsl)
        : rgbToCmykModif(r, g, b, cmyk);
    const toColor = convertersModif[fromModel][toModel](fromColor);
    // console.log(toColor);
    let [nr, ng, nb] =
      toModel === "rgb"
        ? toColor
        : toModel === "hsl"
        ? hslToRgbModif(...toColor, hsl)
        : cmykToRgbModif(...toColor, cmyk);

    // console.log(nr, ng, nb)
    // Detect any change
    if (
      !changeDetected &&
      (Math.abs(nr - r) > epsilon ||
        Math.abs(ng - g) > epsilon ||
        Math.abs(nb - b) > epsilon)
    ) {
      changeDetected = true;
      console.log("Change detected at pixel", i / 4);
    }

    // Track new
    totalNew.r += nr;
    totalNew.g += ng;
    totalNew.b += nb;
    const newY = luminance(nr, ng, nb);
    sumNewY += newY;
    sumNewY2 += newY * newY;
    sumOrigNew += origY * newY;

    sumSqError += (nr - r) ** 2 + (ng - g) ** 2 + (nb - b) ** 2;

    // Write out
    newData[i] = Math.round(nr);
    newData[i + 1] = Math.round(ng);
    newData[i + 2] = Math.round(nb);
    newData[i + 3] = a;

    updateHist(newHist, Math.round(nr), Math.round(ng), Math.round(nb));
  }

  // Draw canvases
  canvas1Manager.ctx.putImageData(imageData, 0, 0);
  canvas2Manager.ctx.putImageData(newImageData, 0, 0);
  canvas1Manager.typeModel = fromModel;
  canvas2Manager.typeModel = toModel;
  canvas1Manager.updateTitle();
  canvas2Manager.updateTitle();
  canvas1Manager.imageLoaded = canvas2Manager.imageLoaded = true;

  // Compute metrics
  const avgOrig = computeAverage(
    totalOrig.r,
    totalOrig.g,
    totalOrig.b,
    pixelCount
  );
  const avgNew = computeAverage(totalNew.r, totalNew.g, totalNew.b, pixelCount);

  const rms = computeRMS(sumSqError, pixelCount);
  const mse = sumSqError / (pixelCount * 3);
  const psnr = computePSNR(mse);

  const ssim = computeSSIM(
    sumOrigY,
    sumNewY,
    sumOrigY2,
    sumNewY2,
    sumOrigNew,
    pixelCount
  );

  // Histogram difference
  const diffHist = { r: 0, g: 0, b: 0 };
  for (let v = 0; v < 256; v++) {
    diffHist.r += Math.abs(origHist.r[v] - newHist.r[v]);
    diffHist.g += Math.abs(origHist.g[v] - newHist.g[v]);
    diffHist.b += Math.abs(origHist.b[v] - newHist.b[v]);
  }

  showMetrics({
    avgOrig,
    avgNew,
    mse,
    rms,
    psnr,
    ssim,
    histDiff: diffHist,
    changed: changeDetected,
  });
  toggleButtonsState(true);
  resetFormModif();
}

function updateModificationForm() {
  const from = document.getElementById("fromColor").value;
  const to = document.getElementById("toColor").value;

  const hslFields = document.getElementById("hslModFields");
  const cmykFields = document.getElementById("cmykModFields");
  const applyBtn = document.getElementById("applyModification");

  const pair = [from, to];

  const hasHSL = pair.includes("hsl");
  const hasCMYK = pair.includes("cmyk");

  const sameSystem = from === to;

  // Перевірка, чи хоча б одна канвас відкрита
  isCanvas1Open = canvas1Manager.canvas.style.display !== "none";
  isCanvas2Open = canvas2Manager.canvas.style.display !== "none";
  applyBtn.disabled = sameSystem || (!hasHSL && !hasCMYK);
  applyBtn.disabled = sameSystem;
  // Якщо лише одна канвас відкрита, приховуємо форми
  if (isCanvas1Open !== isCanvas2Open) {
    hslFields.classList.add("hidden");
    cmykFields.classList.add("hidden");
    applyBtn.disabled = true;
  } else {
    hslFields.classList.toggle("hidden", !hasHSL || sameSystem);
    cmykFields.classList.toggle("hidden", !hasCMYK || sameSystem);
  }

  // console.log(sameSystem);
}

function convertCanvasModifData() {
  // Зчитування модифікацій
  hsl.h = parseFloat(document.getElementById("hDelta").value) || 0;
  hsl.s = parseFloat(document.getElementById("sDelta").value) || 0;
  hsl.l = parseFloat(document.getElementById("lDelta").value) || 0;

  cmyk.c = parseFloat(document.getElementById("cDelta").value) || 0;
  cmyk.m = parseFloat(document.getElementById("mDelta").value) || 0;
  cmyk.y = parseFloat(document.getElementById("yDelta").value) || 0;
  cmyk.k = parseFloat(document.getElementById("kDelta").value) || 0;

  // Зчитування стану чекбокса
  isArtificialInfluenceEnabled = document.getElementById(
    "enableArtificialInfluence"
  ).checked;

  // Перевірка діапазонів
  const isInRange = (val) => val >= -1.0 && val <= 1.0;

  if (
    !isInRange(hsl.h) ||
    !isInRange(hsl.s) ||
    !isInRange(hsl.l) ||
    !isInRange(cmyk.c) ||
    !isInRange(cmyk.m) ||
    !isInRange(cmyk.y) ||
    !isInRange(cmyk.k)
  ) {
    alert("Значення повинні бути в діапазоні від -1.0 до 1.0.");
    return false;
  }

  // console.log("HSL модифікація:", hsl);
  // console.log("CMYK модифікація:", cmyk);
  // console.log("Штучний вплив увімкнено:", isArtificialInfluenceEnabled);

  return true;
}

function updateColorAttributes() {
  const hueStart = parseInt(hueStartSlider.value);
  const hueEnd = parseInt(hueEndSlider.value);
  const saturation = parseInt(saturationSlider.value);
  const lightness = parseInt(lightnessSlider.value);

  const ctx = currentCanvasManager.ctx;
  const canvas = currentCanvasManager.canvas;

  let x = currentCanvasManager.rectX;
  let y = currentCanvasManager.rectY;
  let width = currentCanvasManager.rectWidth;
  let height = currentCanvasManager.rectHeight;




  if (width <= 0 || height <= 0) {
    x = 0;
    y = 0;
    width = canvas.width;
    height = canvas.height;
  }

  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    const [h, s, l] = rgbToHslDegree(r, g, b);
    if (isNaN(h) || isNaN(s) || isNaN(l)) continue;

    if (h >= hueStart && h <= hueEnd) {
      const [newR, newG, newB] = hslToRgbDegree(h, saturation, lightness);
      data[i] = newR;
      data[i + 1] = newG;
      data[i + 2] = newB;
    }
  }

  // 1. Вставити змінений фрагмент
  ctx.putImageData(imageData, x, y);

  // 2. Оновити загальне зображення
  currentCanvasManager.imageData = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // 3. Очистити весь canvas (включаючи прямокутник)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 4. Перемалювати все оновлене зображення без рамки
  ctx.putImageData(currentCanvasManager.imageData, 0, 0);

  // 5. Скинути виділення
  currentCanvasManager.rectX = 0;
  currentCanvasManager.rectY = 0;
  currentCanvasManager.rectWidth = 0;
  currentCanvasManager.rectHeight = 0;
  resetHSLForm();
}

// Функція для масштабування hue
function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

function toggleButtonsState(state) {
  const buttons = document.querySelectorAll(".navigation-buttons button");
  buttons.forEach((button) => {
    button.disabled = state; // Встановлюємо стан disabled для кожної кнопки
  });
}

function resetFormModif() {
  // Скидання значень полів HSL
  document.getElementById("hDelta").value = 0;
  document.getElementById("sDelta").value = 0;
  document.getElementById("lDelta").value = 0;

  // Скидання значень полів CMYK
  document.getElementById("cDelta").value = 0;
  document.getElementById("mDelta").value = 0;
  document.getElementById("yDelta").value = 0;
  document.getElementById("kDelta").value = 0;

  // Скидання стану checkbox
  document.getElementById("enableArtificialInfluence").checked = false;
}

function resetHSLForm() {
  // Скидання значень слайдерів до початкових значень
  document.getElementById("hueStart").value = 0;
  document.getElementById("hueEnd").value = 360;
  document.getElementById("saturation").value = 100;
  document.getElementById("lightness").value = 50;

  // Оновлення відображення значень для saturation і lightness
  document.getElementById("saturationValue").textContent = "100%";
  document.getElementById("lightnessValue").textContent = "50%";
}




// hueEndSlider.addEventListener("input", () => {
//   // Оновлюємо максимум для hueStart
//   hueStartSlider.max = hueEndSlider.value;

//   // Якщо hueStart перевищує hueEnd — обмежити
//   if (parseInt(hueStartSlider.value) > parseInt(hueEndSlider.value)) {
//     hueStartSlider.value = hueEndSlider.value;
//   }
// });

// hueStartSlider.addEventListener("input", () => {
//   // Якщо hueStart перевищує hueEnd — обмежити
//   if (parseInt(hueStartSlider.value) > parseInt(hueEndSlider.value)) {
//     hueStartSlider.value = hueEndSlider.value;
//   }
// });