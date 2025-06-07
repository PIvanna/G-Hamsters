// RGB → HSL
let isArtificialInfluenceEnabled = false;

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
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
    h /= 6;
  }
  return [h, s, l];
}

// HSL → RGB
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}

// RGB → CMYK
function rgbToCmyk(r, g, b) {
  let c = 1 - r / 255;
  let m = 1 - g / 255;
  let y = 1 - b / 255;
  let k = Math.min(c, m, y);
  if (k === 1) return [0, 0, 0, 1]; // black
  c = (c - k) / (1 - k);
  m = (m - k) / (1 - k);
  y = (y - k) / (1 - k);
  return [c, m, y, k];
}

// CMYK → RGB
function cmykToRgb(c, m, y, k) {
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return [r, g, b];
}

// Зміна кольору: атрибут — "h", "s", "l", значення — зміщення
function modifyColorRGBtoHSL(r, g, b, modifications = {}) {
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    isArtificialInfluenceEnabled
      ? (s = d / (max + min)) // Це змінить поведінку при темних чи світлих кольорах. світліші стануть насиченішими
      : (s = l > 0.5 ? d / (2 - max - min) : d / (max + min));
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
    h /= 6;
  }

  if ("h" in modifications) {
    h = (h + modifications.h) % 1;
    if (h < 0) h += 1;
  }
  if ("s" in modifications) {
    s = Math.min(Math.max(s + modifications.s, 0), 1);
  }
  if ("l" in modifications) {
    l = Math.min(Math.max(l + modifications.l, 0), 1);
  }
  // console.log(h, s, l);

  return [h, s, l];
}

function hslToRgbModif(h, s, l, modifications = {}) {
  // Застосування зміщень, якщо вказані
  // console.log(l)
  
  if ("h" in modifications) {
    h = (h + modifications.h) % 1;
    if (h < 0) h += 1;
  }
  if ("s" in modifications) {
    s = Math.min(Math.max(s + modifications.s, 0), 1);
  }
  if ("l" in modifications) {
    l = Math.min(Math.max(l + modifications.l, 0), 1);
  }

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    isArtificialInfluenceEnabled ? (q += 0.1) : (q += 0); // це змінить яскравість або контраст кольору.
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

function rgbToCmykModif(r, g, b, modifications = {}) {
  let c = 1 - r / 255;
  let m = 1 - g / 255;
  let y = 1 - b / 255;
  let k = Math.min(c, m, y);

  // console.log(k);

  if (k === 1) return [0, 0, 0, 1]; // суто чорний

  isArtificialInfluenceEnabled
    ? (c = Math.pow(c - k, 1.2) / (1 - k)) // експоненціальне спотворення
    : (c = (c - k) / (1 - k));
  isArtificialInfluenceEnabled
    ? (m = Math.pow(m - k, 1.2) / (1 - k))
    : (m = (m - k) / (1 - k));
  isArtificialInfluenceEnabled
    ? (y = Math.pow(y - k, 1.2) / (1 - k))
    : (y = (y - k) / (1 - k));
  // Застосування змін
  if ("c" in modifications) c = Math.min(Math.max(c + modifications.c, 0), 1);
  if ("m" in modifications) m = Math.min(Math.max(m + modifications.m, 0), 1);
  if ("y" in modifications) y = Math.min(Math.max(y + modifications.y, 0), 1);
  if ("k" in modifications) k = Math.min(Math.max(k + modifications.k, 0), 1);

  return [c, m, y, k];
}

function cmykToRgbModif(c, m, y, k, modifications = {}) {
  // Застосування змін до CMYK
  if ("c" in modifications) c = Math.min(Math.max(c + modifications.c, 0), 1);
  if ("m" in modifications) m = Math.min(Math.max(m + modifications.m, 0), 1);
  if ("y" in modifications) y = Math.min(Math.max(y + modifications.y, 0), 1);
  if ("k" in modifications) k = Math.min(Math.max(k + modifications.k, 0), 1);

  // console.log(k);
  let r, g, b;
  isArtificialInfluenceEnabled
    ? (r = 255 * (1 - c) * (1 - k) + 20) // трохи червонішим
    : (r = 255 * (1 - c) * (1 - k));
  isArtificialInfluenceEnabled
    ? (g = 200 * (1 - m) * (1 - k)) // зробити менш яскравим
    : (g = 255 * (1 - m) * (1 - k));
  b = 255 * (1 - y) * (1 - k);

  return [r, g, b];
}

function rgbToHslDegree(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // сіра шкала
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
  return [h, s * 100, l * 100];
}

function hslToRgbDegree(h, s, l) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = l - c / 2;
  let r, g, b;

  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}





function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}
