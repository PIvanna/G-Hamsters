function applyChangesToSelection() {
  if (!SELECTED_EDITOR_ZONE) return;

  const { x1, y1, x2, y2 } = SELECTED_EDITOR_ZONE;
  const width = x2 - x1;
  const height = y2 - y1;

  // Отримуємо дані з оригінального знімка (НЕ з канви!)
  const base = CURRENT_VERSION_BASE;
  const fullCopy = new ImageData(new Uint8ClampedArray(base.data), base.width, base.height);
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

  // Редагуємо тільки потрібну частину
  convertC1ToC2_Part(subImage);

  // Вставляємо її назад у повний знімок
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = index(x1 + x, y1 + y);

      for (let i = 0; i < 4; i++) {
        fullCopy.data[dstIdx + i] = subImage.data[srcIdx + i];
      }
    }
  }

  // Зберігаємо повністю оновлену версію без пунктиру
  tempVersion = fullCopy;

  // Малюємо на канві
  ctxChild.putImageData(tempVersion, 0, 0);
  drawSelection();
}