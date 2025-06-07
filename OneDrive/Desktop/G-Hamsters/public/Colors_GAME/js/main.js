let selectedDifficulty = null;
let selectedTheme = null;

document.querySelectorAll("#difficulty-options .option-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll("#difficulty-options .option-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedDifficulty = card.dataset.value;
  });
});

document.querySelectorAll("#theme-options .image-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll("#theme-options .image-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedTheme = card.dataset.value;
  });
});

function GoToGame() {
  if (!selectedDifficulty || !selectedTheme) {
    alert("Будь ласка, оберіть рівень та тему!");
    return;
  }
  console.log("Починаємо гру з параметрами:", selectedDifficulty, selectedTheme);

 const url = `game.html?difficulty=${encodeURIComponent(selectedDifficulty)}&theme=${encodeURIComponent(selectedTheme)}`;
  window.location.href = url;
}
