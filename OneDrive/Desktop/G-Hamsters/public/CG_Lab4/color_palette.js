function getClusteredColorsFromCanvas(ctx, width, height, numColors) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixels = [];
  
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
  
      if (a < 128) continue; 
  
      pixels.push([r, g, b]);
    }
  
    if (pixels.length === 0) return [];
  
    // Простий кластеризатор (початкові центроїди вибираються випадково)
    const centroids = [];
    for (let i = 0; i < numColors; i++) {
      centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
    }
  
    const maxIterations = 30;
    for (let iter = 0; iter < maxIterations; iter++) {
      const clusters = Array(numColors).fill(0).map(() => []);
  
      // Крок 1: розподіл по найближчому центроїду
      for (const pixel of pixels) {
        let minDist = Infinity;
        let clusterIndex = 0;
  
        for (let i = 0; i < centroids.length; i++) {
          const c = centroids[i];
          const dist = Math.pow(pixel[0] - c[0], 2) + Math.pow(pixel[1] - c[1], 2) + Math.pow(pixel[2] - c[2], 2);
  
          if (dist < minDist) {
            minDist = dist;
            clusterIndex = i;
          }
        }
  
        clusters[clusterIndex].push(pixel);
      }
  
      // Крок 2: оновлення центроїдів
      for (let i = 0; i < numColors; i++) {
        const cluster = clusters[i];
        if (cluster.length === 0) continue;
  
        const mean = cluster.reduce((acc, val) => {
          acc[0] += val[0];
          acc[1] += val[1];
          acc[2] += val[2];
          return acc;
        }, [0, 0, 0]);
  
        centroids[i] = mean.map(x => Math.round(x / cluster.length));
      }
    }
  
    // Повертаємо кольори у форматі rgb()
    return centroids.map(([r, g, b]) => `rgb(${r},${g},${b})`);
  }
  


  let paletteModelIndex = 0;
  
  const colorCountInput = document.getElementById("colorCountInput");


colorCountInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    GeneratePalette();
  }
});
  
  function GeneratePalette() {
    const numColors = Math.min(
      Math.max(parseInt(colorCountInput.value, 10), 3),
      15
    );
  
    const palette = getClusteredColorsFromCanvas(
      ctxChild,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      numColors
    );
  
    const paletteDisplay = document.getElementById("palette-display");
    paletteDisplay.innerHTML = ""; 
  
    palette.forEach((colorStr) => {
      const rgb = colorStr.match(/\d+/g).map(Number); 
      const [r, g, b] = rgb;

      const colorBox = document.createElement("div");
    colorBox.style.backgroundColor = colorStr;
    colorBox.style.width = "100%";
    colorBox.style.height = "32px";
    colorBox.style.border = "1px solid #aaa";
    colorBox.style.display = "flex";
    colorBox.style.alignItems = "center";
    colorBox.style.justifyContent = "center";
  
    colorBox.style.fontSize = "10px";
    colorBox.style.cursor = "pointer";

    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    colorBox.style.color = brightness < 128 ? "#fff" : "#000";

    const label = document.createElement("div");
    label.style.fontSize = "11px";
    label.style.marginTop = "2px";
    label.style.cursor = "pointer";
  
      // Початковий текст
      updatePaletteLabel(label, rgb);
  
      // Обробка кліку
      const handleClick = (e) => {
        if (e.ctrlKey) {
          navigator.clipboard.writeText(label.textContent).then(() => {
            console.log("Копійовано:", label.textContent);
            ShowNotification("Значення кольору скопійовано!");
          }).catch(err => {
            console.error("Помилка копіювання:", err);
            ShowNotification("Помилка копіювання:", err);
          });
        } else {
          paletteModelIndex = (paletteModelIndex + 1) % models.length;
          updatePaletteLabel(label, rgb);
        }
      };
  
      colorBox.addEventListener("click", handleClick);
      label.addEventListener("click", handleClick);
  
      const container = document.createElement("div");
      container.style.textAlign = "center";
      container.appendChild(colorBox);
      colorBox.appendChild(label);
  
      paletteDisplay.appendChild(container);
    });
    ShowNotification("Палітру оновлено");
  }
  
  function updatePaletteLabel(label, [r, g, b]) {
    const model = models[paletteModelIndex];
    let text = "";
  
    switch (model) {
      case "RGB":
        text = `RGB: ${r}, ${g}, ${b}`;
        break;
      case "CMY":
        const cmy = [255 - r, 255 - g, 255 - b];
        text = `CMY: ${cmy.join(", ")}`;
        break;
      case "HSB":
        const [h, s, b_] = rgbToHsb(r, g, b);
        text = `HSB: ${Math.round(h)}°, ${Math.round(s)}%, ${Math.round(b_)}%`;
        break;
      case "XYZ":
        const [x, y, z] = rgbToXyz(r, g, b);
        text = `XYZ: ${(x*100).toFixed(2)}, ${(y*100).toFixed(2)}, ${(z*100).toFixed(2)}`;
        break;
      case "Lab":
        const [l, a, bLab] = rgbToLab(r, g, b);
        text = `Lab: ${l.toFixed(2)}, ${a.toFixed(2)}, ${bLab.toFixed(2)}`;
        break;
    }
  
    label.textContent = text;
  }
  