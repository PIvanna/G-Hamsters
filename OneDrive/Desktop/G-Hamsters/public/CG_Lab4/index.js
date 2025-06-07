const uploadInput = document.getElementById("upload-file");

const canvasParent = document.getElementById("canvas-parent");
const canvasChild = document.getElementById("canvas-child");

const ctxParent = canvasParent.getContext("2d", { willReadFrequently: true });
const ctxChild = canvasChild.getContext("2d", { willReadFrequently: true });

var CANVAS_WIDTH = 1024;
var CANVAS_HEIGHT = 1024;

canvasParent.width = CANVAS_WIDTH;
canvasParent.height = CANVAS_HEIGHT;

canvasChild.width = CANVAS_WIDTH;
canvasChild.height = CANVAS_HEIGHT;

const slidersLAB = {
  l: document.getElementById("lSliderLab"),
  a: document.getElementById("aSliderLab"),
  b: document.getElementById("bSliderLab"),
};

const slidersRGB = {
  l: document.getElementById("rSlider"),
  a: document.getElementById("gSlider"),
  b: document.getElementById("bSliderRgb"),
};

let imageOffsetX = 0;
let imageOffsetY = 0;
let imageDrawnWidth = 0;
let imageDrawnHeight = 0;

var CURRENT_VERSION_BASE = null;
var SUB_VERSION = null;
var isToSaveSubVErsion = false;

// ЗАГАЛЬНІ ФУНКЦІЇ =============================================

uploadInput.addEventListener("change", function () {
  const file = this.files[0];
  console.log("📁 Обрано файл через input");

  if (!file) {
    console.log("⚠️ Файл не вибрано.");
    ShowNotification("Файл не обрано! Спробуйте знову");
    return;
  }
  console.log("📁 Обрано файл:", file.name);

  const reader = new FileReader();
  reader.onload = function (e) {
    console.log("📖 Файл прочитано як Data URL");
    const img = new Image();
    img.onload = function () {
      console.log(
        "🖼️ Зображення завантажено. Розміри:",
        img.width,
        "x",
        img.height
      );

      ctxParent.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const scale = Math.min(
        CANVAS_WIDTH / img.width,
        CANVAS_HEIGHT / img.height
      );

      const newWidth = img.width * scale;
      const newHeight = img.height * scale;

      const offsetX = (CANVAS_WIDTH - newWidth) / 2;
      const offsetY = (CANVAS_HEIGHT - newHeight) / 2;

      imageOffsetX = offsetX;
      imageOffsetY = offsetY;
      imageDrawnWidth = newWidth;
      imageDrawnHeight = newHeight;

      ctxParent.drawImage(img, offsetX, offsetY, newWidth, newHeight);

      CURRENT_VERSION_BASE = ctxParent.getImageData(
        0,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );
      console.log("✅ Зображення намальовано на canvas-parent");
      ShowNotification("Зображення завантажено");
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});

var PHOTO_ID = 0;
function SavePhoto(id) {
  var link = document.createElement("a");
  if (id == 1) {
    link.href = canvasParent.toDataURL("image/png");
    link.download = `original_${PHOTO_ID}.png`;
  } else {
    isAlreadySaved = false;
    SaveVersion();

    ctxChild.putImageData(CURRENT_VERSION_BASE, 0, 0);

    link.href = canvasChild.toDataURL("image/png");
    link.download = `edited_${PHOTO_ID}.png`;
  }

  PHOTO_ID++;
  link.click();
  if (id != 1) {
    drawSelectionBorder();
  }
  ShowNotification("Зображення збережено");
}

async function ShowNotification(message) {
  const notify = document.getElementById("notify");
  notify.textContent = message;
  notify.classList.add("show");

  setTimeout(() => {
    notify.classList.remove("show");
  }, 2000);
}

//=====================================================================

function ResetModify() {
  for (let i = 1; i <= 3; i++) {
    const slider = document.getElementById(`component-${i}-slider`);
    const input = document.getElementById(`component-${i}-input`);

    if (slider && input) {
      slider.value = 0;
      input.value = 0;
    }
  }

  convertC1ToC2();
}

function ApplyEditorDeltas(color) {
  const model = MODEL_EDIT; // LAB або RGB
  const components = modelSliders[model].components;

  const result = { ...color };

  components.forEach((comp, i) => {
    const label = comp.label;
    const delta = parseFloat(
      document.getElementById(`component-${i + 1}-slider`).value
    );

    let newValue = (result[label] || 0) + delta;

    // Обмеження значення в межах допустимих
    if (model === "RGB") {
      newValue = Math.max(0, Math.min(255, newValue));
    } else if (model === "LAB") {
      if (label == "L") {
        newValue = Math.max(0, Math.min(100, newValue));
      } else {
        newValue = Math.max(-128, Math.min(128, newValue));
      }
    }

    result[label] = newValue;
  });

  return result;
}

var isAlreadySaved = false;

function SaveVersion() {
  if (isAlreadySaved != true) {
    ctxChild.clearRect(0, 0, canvasChild.width, canvasChild.height);

    if (SUB_VERSION != null) {
      CURRENT_VERSION_BASE = SUB_VERSION;
      SUB_VERSION = null;
    } 
    ctxChild.putImageData(CURRENT_VERSION_BASE, 0, 0);
    

    if (SELECTED_EDITOR_ZONE) {
      const { x1, y1, x2, y2 } = SELECTED_EDITOR_ZONE;
      const width = x2 - x1;
      const height = y2 - y1;

      const base = CURRENT_VERSION_BASE;
      const index = (x, y) => (y * base.width + x) * 4;
      const subImage = ctxChild.createImageData(width, height);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const srcIdx = index(x1 + x, y1 + y);
          const dstIdx = (y * width + x) * 4;
          for (let i = 0; i < 4; i++) {
            subImage.data[dstIdx + i] = base.data[srcIdx + i];
          }
        }
      }

      convertC1ToC2_Part(subImage);
      ctxChild.putImageData(subImage, x1, y1);
    }

    CURRENT_VERSION_BASE = ctxChild.getImageData(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    if (SELECTED_EDITOR_ZONE) {
      drawSelection();
    }
    isAlreadySaved = true;
    SUB_VERSION = null;

    ShowNotification("Проміжну версію збережено!");
    console.log("Версія збережена");
  } else {
    ShowNotification("Зміни вже давно збережено:) Don`t worry");
    console.log("Версія збережена");
  }
}

function DiscardChanges() {
  CURRENT_VERSION_BASE = ctxParent.getImageData(
    0,
    0,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  );
  ctxChild.putImageData(CURRENT_VERSION_BASE, 0, 0);
  isAlreadySaved = false;
  ShowNotification("Всі зміни скасовано");
  console.log("Всі зміни скасовано ( батьківська версія)");
}

function BackVersion() {
  ctxChild.putImageData(CURRENT_VERSION_BASE, 0, 0);
}

function AddModify() {
  

  convertC1ToC2();
}

//===================================
const conversionActions = {
  "rgb->cmy": (imageData) => {
    console.log("Конвертація з RGB у CMY");
    ConvertImage(imageData, (r, g, b) => {
      let [c, m, y] = rgbToCmy(r, g, b);
      return cmyToRgb(c, m, y);
    });
  },

  "cmy->rgb": (imageData) => {
    console.log("Конвертація з CMY to RGB");
    ConvertImage(imageData, (r, g, b) => {
      let [c, m, y] = rgbToCmy(r, g, b);
      return cmyToRgb(c, m, y);
    });
  },

  "rgb->lab": (imageData) => {
    console.log("Конвертація з RGB у LAB");
    ConvertImage(imageData, (r, g, b) => {
      if (MODEL_EDIT == "RGB") {
        let rgb = { R: r, G: g, B: b };
        rgb = ApplyEditorDeltas(rgb);
        r = rgb.R;
        g = rgb.G;
        b = rgb.B;
      }

      var [L_, A_, B_] = rgbToLab(r, g, b);

      if (MODEL_EDIT == "LAB") {
        let lab = { L: L_, A: A_, B: B_ }; // 👈 правильні ключі
        lab = ApplyEditorDeltas(lab);
        L_ = lab.L;
        A_ = lab.A;
        B_ = lab.B;
      }

      return labToRgb(L_, A_, B_);
    });
  },
  "lab->rgb": (imageData) => {
    console.log("Конвертація з LAB у RGB");
    ConvertImage(imageData, (r, g, b) => {
      // const [L, A, B] = rgbToLab(r, g, b);
      // return labToRgb(L, A, B);

      if (MODEL_EDIT == "RGB") {
        let rgb = { R: r, G: g, B: b };
        rgb = ApplyEditorDeltas(rgb);
        r = rgb.R;
        g = rgb.G;
        b = rgb.B;
      }

      var [L_, A_, B_] = rgbToLab(r, g, b);

      if (MODEL_EDIT == "LAB") {
        let lab = { L: L_, A: A_, B: B_ }; // 👈 правильні ключі
        lab = ApplyEditorDeltas(lab);
        L_ = lab.L;
        A_ = lab.A;
        B_ = lab.B;
      }

      return labToRgb(L_, A_, B_);
    });
  },

  "rgb->hsl": (imageData) => {
    console.log("Конвертація з RGB у HSL");
    ConvertImage(imageData, (r, g, b) => {
      var [H, S, L] = rgbToHsl(r, g, b);
      return HslToRgb(H, S, L);
    });
  },

  "hsl->rgb": (imageData) => {
    console.log("Конвертація з HSL RGB");
    ConvertImage(imageData, (r, g, b) => {
      var [H, S, L] = rgbToHsl(r, g, b);
      return HslToRgb(H, S, L);
    });
  },

  "rgb->hsb": (imageData) => {
    console.log("Конвертація з RGB у HSB");
    ConvertImage(imageData, (r, g, b) => {
       var [H, S, B] = rgbToHsb(r, g, b);
       //var [H, S, B] = rgbToHsl(r, g, b);

      const hueMin = parseFloat(document.getElementById("hueMin-slider").value);
      const hueMax = parseFloat(document.getElementById("hueMax-slider").value);
      const saturation = parseFloat(
        document.getElementById("saturation-slider").value
      );
      const brightness = parseFloat(
        document.getElementById("brightness-slider").value
      );

      const inHueRange =
        hueMin <= hueMax
          ? H >= hueMin && H <= hueMax
          : H >= hueMin || H <= hueMax; // обгортання через 0

      if (inHueRange) {
        S = Math.max(0, Math.min(100, S + saturation));
        B = Math.max(0, Math.min(100, B + brightness));
      }
      
//return HslToRgb(H,S,B);
     return hsbToRgb(H, S, B);
    });
  },

  "hsb->rgb": (imageData) => {
    console.log("Конвертація з HSB у RGB");
    ConvertImage(imageData, (r, g, b) => {
      var [H, S, B] = rgbToHsb(r, g, b);

      const hueMin = parseFloat(document.getElementById("hueMin-slider").value);
      const hueMax = parseFloat(document.getElementById("hueMax-slider").value);
      const saturation = parseFloat(
        document.getElementById("saturation-slider").value
      );
      const brightness = parseFloat(
        document.getElementById("brightness-slider").value
      );

      const inHueRange =
        hueMin <= hueMax
          ? H >= hueMin && H <= hueMax
          : H >= hueMin || H <= hueMax; // обгортання через 0

      if (inHueRange) {
        S = Math.max(0, Math.min(100, S + saturation));
        B = Math.max(0, Math.min(100, B + brightness));
      }
      return hsbToRgb(H, S, B);
    });
  },
  "xyz->rgb": (imageData) => {
    console.log("Конвертація xyz->rgb");
    ConvertImage(imageData, (r, g, b) => {
      const [X, Y, Z] = rgbToXyz(r, g, b);
      return xyzToRGB(X, Y, Z);
    });
  },
  "rgb->xyz": (imageData) => {
    console.log("Конвертація rgb->xyz");
    ConvertImage(imageData, (r, g, b) => {
      const [X, Y, Z] = rgbToXyz(r, g, b);
      return xyzToRGB(X, Y, Z);
    });
  },
  "lab->xyz": (imageData) => {
    console.log("Конвертація lab->xyz");
    ConvertImage(imageData, (r, g, b) => {
      const [L, A, B] = rgbToLab(r, g, b);
      const [X, Y, Z] = labToXyz(L, A, B);
      return xyzToRGB(X, Y, Z);
    });
  },
  "xyz->lab": (imageData) => {
    console.log("Конвертація xyz->lab");
    ConvertImage(imageData, (r, g, b) => {
      const [X, Y, Z] = rgbToXyz(r, g, b);
      const [L, A, B] = xyzToLab(X, Y, Z);
      return labToRgb(L, A, B);
    });
  },
};

var IS_PART_EDIT = false;

function ConvertImage(imageData, ColorConvertFunction) {
  //const imageData = CURRENT_VERSION_BASE;
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const [newR, newG, newB] = ColorConvertFunction(r, g, b);

    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }

  //canvasChild.width = canvasParent.width;
  //canvasChild.height = canvasParent.height;
  if (IS_PART_EDIT && SELECTED_EDITOR_ZONE) {
    ctxChild.putImageData(
      imageData,
      SELECTED_EDITOR_ZONE.x1,
      SELECTED_EDITOR_ZONE.y1
    );
  } else {
    ctxChild.putImageData(imageData, 0, 0);
  }
}

function convertC1ToC2() {
  isAlreadySaved = false;
  if (ACTIVE_TOOL == "selector" && hasSelection==true) {
    console.log("АКТИВНЕ ЩЕ ВИДІЛЕННЯ");
    changeColorInSelection();
    drawSelectionBorder();
    //isAlreadySaved = true;
    return;
  }

  console.log("MODEL = " + MODEL_EDIT);

  const fromSelect = document.getElementById("fromSelect");
  const toSelect = document.getElementById("toSelect");

  const key = `${fromSelect.value}->${toSelect.value}`;
  const action = conversionActions[key];
  if (!action) {
    console.warn("Непідтримувана конверсія");
    return;
  }

 
  SUB_VERSION = structuredClone(CURRENT_VERSION_BASE);
  

   action(SUB_VERSION);

  CompareColorsPercantage();
  ShowNotification("Зображення перетворено!");
}

function UpdateDifferInfo(
  matchPercentage,
  mismatchPercentage,
  maxDeviation,
  minDeviation,
  mostDifferent,
  leastDifferent
) {
  const safeValue = (val) =>
    val === undefined || val === null || isNaN(val) || !isFinite(val)
      ? "0.0"
      : `${val}`;

  // Оновлення відсотків
  document.getElementById(
    "match-percentage"
  ).textContent = `Співпадіння: ${matchPercentage}%`;
  document.getElementById(
    "mismatch-percentage"
  ).textContent = `Неспівпадіння: ${mismatchPercentage}%`;

//  if (Number(maxDeviation) - Number(minDeviation) === 0) {
//     document.getElementById("max-deviation").textContent = "";
//     document.getElementById("min-deviation").textContent = "";
//     // Якщо у вас є контейнери для кольорових блоків – теж очищаємо
//     document.getElementById("most-modified").innerHTML = "";
//     document.getElementById("min-modified").innerHTML = "";
//     return;
//   }

  // Оновлення відхилень
  document.getElementById(
    "max-deviation"
  ).textContent = `Максимальне відхилення: ${maxDeviation}`;
  document.getElementById(
    "min-deviation"
  ).textContent = `Мінімальне відхилення: ${safeValue(minDeviation)}`;

  if (mostDifferent) {
    ShowColorDifference(
      "most-modified",
      "Max Difference\n",
      mostDifferent.modified
    );
  }else{
     document.getElementById("most-modified").innerHTML = "";
     document.getElementById("most-modified").style.backgroundColor = "white";
  }

  if (leastDifferent) {
    ShowColorDifference(
      "min-modified",
      "Min Difference\n",
      leastDifferent.modified
    );
  } else {
    document.getElementById("min-modified").innerHTML = "";
     document.getElementById("min-modified").style.backgroundColor = "white";
  }

}

function CompareColorsPercantage() {
  const ctx1 = canvasParent.getContext("2d");
  const ctx2 = canvasChild.getContext("2d");

  const w = canvasParent.width;
  const h = canvasParent.height;

  const imgData1 = ctx1.getImageData(0, 0, w, h).data;
  const imgData2 = ctx2.getImageData(0, 0, w, h).data;

  let equalCount = 0;
  let notEqualCount = 0;

  let maxDiff = 0;
  let minDiff = Infinity;

  let mostDifferent = null;
  let leastDifferent = null;

  function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  }

  for (
    let y = Math.floor(imageOffsetY);
    y < imageOffsetY + imageDrawnHeight;
    y++
  ) {
    for (
      let x = Math.floor(imageOffsetX);
      x < imageOffsetX + imageDrawnWidth;
      x++
    ) {
      const i = (y * w + x) * 4;

      const r1 = imgData1[i];
      const g1 = imgData1[i + 1];
      const b1 = imgData1[i + 2];
      const a1 = imgData1[i + 3];

      const r2 = imgData2[i];
      const g2 = imgData2[i + 1];
      const b2 = imgData2[i + 2];
      const a2 = imgData2[i + 3];

      if (a1 === 0 && a2 === 0) continue; // пропускаємо прозорі

      const diff = colorDistance(r1, g1, b1, r2, g2, b2);

      if (diff === 0) {
        equalCount++;
      } else {
        notEqualCount++;

        if (diff > maxDiff) {
          maxDiff = diff;
          mostDifferent = {
            x,
            y,
            original: [r1, g1, b1],
            modified: [r2, g2, b2],
            diff,
          };
        }

        if (diff < minDiff) {
          minDiff = diff;
          leastDifferent = {
            x,
            y,
            original: [r1, g1, b1],
            modified: [r2, g2, b2],
            diff,
          };
        }
      }
    }
  }

  const total = equalCount + notEqualCount;
  const equalPercent = ((equalCount / total) * 100).toFixed(2);
  const notEqualPercent = ((notEqualCount / total) * 100).toFixed(2);

  // console.log("Equal count = " + equalCount);
  // console.log("NOT equal count = " + notEqualCount);

  UpdateDifferInfo(
    equalPercent,
    notEqualPercent,
    maxDiff.toFixed(2),
    minDiff.toFixed(2),
    mostDifferent,
    leastDifferent
  );

  // console.log(`✅ EQUAL: ${equalPercent}%`);
  // console.log(`❌ NOT EQUAL: ${notEqualPercent}%`);
  // console.log(`📏 MAX DIFFERENCE: ${maxDiff.toFixed(2)}`);
  // console.log(`📏 MIN DIFFERENCE (non-zero): ${minDiff.toFixed(2)}`);
}

function ShowColorDifference(id, label, rgb) {
  const [r, g, b] = rgb;
  const color = `rgb(${r}, ${g}, ${b})`;

 // console.log("COLOR = " + color);
  const el = document.getElementById(id);
  if (el) {
    el.style.backgroundColor = color;

    // Обчислення яскравості (перцептивної)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    el.style.color = brightness < 128 ? "white" : "black";

    // Оновлення тексту: перший рядок — "Min" або "Max", другий — RGB колір
    el.innerHTML = `<strong>${label}</strong><br>RGB: ${r}, ${g}, ${b}`;

    el.style.padding = "4px";
    el.style.fontSize = "12px";
  }
}

//====================================
// RGB -> HSB
function rgbToHsb(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);

  let h = 0,
    s = 0,
    v = max;
  const delta = max - min;

  s = max === 0 ? 0 : delta / max;

  if (delta !== 0) {
    if (max === r) h = (g - b) / delta + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / delta + 2;
    else if (max === b) h = (r - g) / delta + 4;
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
   //return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(v * 100)];
 // return [h * 360,s * 100, v * 100];
}
// HSB -> RGB
function hsbToRgb(h, s, v) {
  s /= 100;
  v /= 100;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r, g, b;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    //return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
   //return [r * 255, g * 255, b * 255];
}

function rgbToXyz(r, g, b) {
  // Нормалізація
  r /= 255;
  g /= 255;
  b /= 255;

  // Гамма-корекція (sRGB)
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  const isModify = document.getElementById("is-modify-lab-to-rgb");

  var x = 0,
    y = 0,
    z = 0;
  if (isModify.checked) {
    x = r * 0.3 + g * 0.6 + b * 0.05;
    y = r * 0.6 + g * 0.05 + b * 0.3;
    z = r * 0.1 + g * 0.4 + b * 0.5;
  } else {
    x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    z = r * 0.0193 + g * 0.1192 + b * 0.9505;
  }

  x = Math.min(x, 1); // 0.95
  y = Math.min(y, 1); // 1.00
  z = Math.min(z, 1); // СТАЛО 1.00 замість 1.08

  return [x, y, z];
}

function xyzToLab(X, Y, Z) {
  const isModify = document.getElementById("is-modify-lab-to-rgb");

  var eps = 0;
  if (isModify.checked) {
    X /= 0.9;
    Y /= 1.0;
    Z /= 1.1;

    eps = 0.009;
  } else {
    X /= 0.950456; //0.950456
    Y /= 1.0;
    Z /= 1.088754; //1.088754

    eps = 0.008856;
  }

  function f(t) {
    return t > eps ? Math.pow(t, 1.0 / 3.0) : 7.787 * t + 16 / 116;
  }

  const fx = f(X);
  const fy = f(Y);
  const fz = f(Z);

  const L = 116 * fy - 16;
  const A = 500 * (fx - fy);
  const B = 200 * (fy - fz);

  return [L, A, B];
}

function rgbToLab(r, g, b) {
  var [x, y, z] = rgbToXyz(r, g, b);
  var [L, A, B] = xyzToLab(x, y, z);
  return [L, A, B];
}

function labToXyz(L, a, b) {
  const isModify = document.getElementById("is-modify-lab-to-rgb");

  let Y = (L + 16) / 116;
  let X = a / 500 + Y;
  let Z = Y - b / 200;

  let Y3 = Math.pow(Y, 3);
  let X3 = Math.pow(X, 3);
  let Z3 = Math.pow(Z, 3);

  var eps = 0;

  if (isModify.checked) {
    //console.log("M  O  D  I F  I  C  A  T I  O  N");
    eps = 0.009;
  } else {
    eps = 0.008856;
  }

  Y = Y3 > eps ? Y3 : (Y - 16 / 116) / 7.787;
  X = X3 > eps ? X3 : (X - 16 / 116) / 7.787;
  Z = Z3 > eps ? Z3 : (Z - 16 / 116) / 7.787;

  if (isModify.checked) {
    X *= 0.9;
    Y *= 1.0;
    Z *= 1.1;
  } else {
    X *= 0.950456;
    Y *= 1.0;
    Z *= 1.088754;
  }

  return [X, Y, Z];
}

function xyzToRGB(X, Y, Z) {
  // const isModify = document.getElementById("is-modify-lab-to-rgb");
  // let R, G, B;

  // if (isModify.checked) {
  //   // спрощена матриця
  //   // X,Y,Z у твоєму коді відповідають r,g,b у цьому контексті
  //   R = X * 0.3    + Y * 0.6    + Z * 0.05;
  //   G = X * 0.6    + Y * 0.05   + Z * 0.3;
  //   B = X * 0.1    + Y * 0.4    + Z * 0.5;
  // } else {
  //   // стандартна CIE→sRGB матриця
  //   R = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
  //   G = X * -0.9689+ Y * 1.8758  + Z * 0.0415;
  //   B = X * 0.0557 + Y * -0.2040 + Z * 1.0570;
  // }

  let R = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
  let G = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
  let B = X * 0.0557 + Y * -0.204 + Z * 1.057;

  R = R > 0.0031308 ? 1.055 * Math.pow(R, 1 / 2.4) - 0.055 : 12.92 * R;
  G = G > 0.0031308 ? 1.055 * Math.pow(G, 1 / 2.4) - 0.055 : 12.92 * G;
  B = B > 0.0031308 ? 1.055 * Math.pow(B, 1 / 2.4) - 0.055 : 12.92 * B;

  return [
    Math.min(255, Math.max(0, Math.round(R * 255))),
    Math.min(255, Math.max(0, Math.round(G * 255))),
    Math.min(255, Math.max(0, Math.round(B * 255))),
  ];
}

function labToRgb(L, a, b) {
  const [X, Y, Z] = labToXyz(L, a, b);
  const [R, G, B] = xyzToRGB(X, Y, Z);
  return [R, G, B];
}

function rgbToCmy(r, g, b) {
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  const c = 255 - r;
  const m = 255 - g;
  const y = 255 - b;

  return [c, m, y];
}

function cmyToRgb(c, m, y) {
  c = Math.min(255, Math.max(0, c));
  m = Math.min(255, Math.max(0, m));
  y = Math.min(255, Math.max(0, y));

  const r = 255 - c;
  const g = 255 - m;
  const b = 255 - y;
  return [r, g, b];

  return [r, g, b];
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // світлість
  let l = (max + min) / 2;

  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
  }

  let h = 0;
  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  // return [ h, s * 100, l * 100 ];
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function HslToRgb(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s; // chroma
  const hh = h / 60; // сектор колірного кола
  const x = c * (1 - Math.abs((hh % 2) - 1));

  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (hh >= 0 && hh < 1) {
    [r1, g1, b1] = [c, x, 0];
  } else if (hh >= 1 && hh < 2) {
    [r1, g1, b1] = [x, c, 0];
  } else if (hh >= 2 && hh < 3) {
    [r1, g1, b1] = [0, c, x];
  } else if (hh >= 3 && hh < 4) {
    [r1, g1, b1] = [0, x, c];
  } else if (hh >= 4 && hh < 5) {
    [r1, g1, b1] = [x, 0, c];
  } else if (hh >= 5 && hh < 6) {
    [r1, g1, b1] = [c, 0, x];
  }

  const m = l - c / 2;
  // Переводимо назад в [0…255]
  const r =Math.round((r1 + m) * 255);
  const g =Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  return [r, g, b];
}

//============================================
