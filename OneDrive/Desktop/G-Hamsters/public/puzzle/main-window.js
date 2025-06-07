import { db } from "../js/firebase-config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

class PuzzleImage {
  constructor(uid, path, name) {
    this.uid = uid;
    this.path = path;
    this.name = name;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM повністю завантажено");

  async function fetchPuzzleImages() {
    const imageContainer = document.getElementById("imageContainer");

    if (!imageContainer) {
      console.error("❌ Не знайдено елемент з id='imageContainer'");
      return;
    }

    console.log("🔄 Отримуємо картинки з Firestore...");

    try {
      const querySnapshot = await getDocs(collection(db, "puzzle"));
      console.log(`✅ Отримано ${querySnapshot.size} документ(ів) з 'puzzle'`);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("📄 Документ:", doc.id, data);

        const image = new PuzzleImage(doc.id, data.path, data.name); // <- name

        // Контейнер для зображення та імені
        const wrapper = document.createElement("div");
        wrapper.classList.add("image-wrapper");

        // Зображення
        const img = document.createElement("img");
        img.src = image.path;
        img.alt = `Puzzle ${image.uid}`;
        img.onclick = () => selectImage(image.path);

        console.log(image)
        // Назва фракталу
        const caption = document.createElement("p");
        caption.textContent = image.name || "Без назви";
        caption.classList.add("image-caption");

        wrapper.appendChild(img);
        wrapper.appendChild(caption);
        imageContainer.appendChild(wrapper);

        console.log(`🖼️ Додано зображення: ${image.path} (${image.name})`);
      });
    } catch (error) {
      console.error("❌ Помилка при отриманні документів:", error);
    }
  }

  function selectImage(path) {
    console.log(`➡️ Вибрано зображення: ${path}`);
    localStorage.setItem("selectedImage", path);
    window.location.href = "puzzle.html";
  }

  fetchPuzzleImages();
});

// main-window.js
document.getElementById("go-back").addEventListener("click", () => {
  window.location.href = "../main.html"; // ← заміни на потрібний файл
});
