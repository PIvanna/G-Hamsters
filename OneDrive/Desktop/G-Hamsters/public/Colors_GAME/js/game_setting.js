function RandomizeArray(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const hamsterTypeGif = {
  hamster_1:
    "https://console.firebase.google.com/u/0/project/noa2-8fefc/storage/noa2-8fefc.appspot.com/files/~2FMaria",
  hamster_2:
    "https://console.firebase.google.com/u/0/project/noa2-8fefc/storage/noa2-8fefc.appspot.com/files/~2FMaria",
  hamster_3:
    "https://console.firebase.google.com/u/0/project/noa2-8fefc/storage/noa2-8fefc.appspot.com/files/~2FMaria",
  hamster_4:
    "https://console.firebase.google.com/u/0/project/noa2-8fefc/storage/noa2-8fefc.appspot.com/files/~2FMaria",
  hamster_5:
    "https://console.firebase.google.com/u/0/project/noa2-8fefc/storage/noa2-8fefc.appspot.com/files/~2FMaria",
};

const hamsterTypePNG = {
  hamster_1:
    "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/Maria%2Fhamster_1.png?alt=media&token=fc174733-e0e2-44ba-8c47-8a076715c203",
  hamster_2:
    "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/Maria%2Fhamster_2.png?alt=media&token=bdf3d6f7-0b99-4eaf-82e1-95de72f57666",
  hamster_3:
    "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/Maria%2Fhamster_3.png?alt=media&token=9830a39d-d60c-4753-9fc7-a8307447f75b",
  hamster_4:
    "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/Maria%2Fhamster_4.png?alt=media&token=af5570a8-3c24-4a14-9c11-21f897f47991",
  hamster_5:
    "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/Maria%2Fhamster_5.png?alt=media&token=ae3368e9-cad8-4fed-839d-2eb0d4f11840",
};

function CreateCards(numPairs) {
  if (numPairs > COLORS_DB.length) {
    throw new Error("Занадто велика кількість пар для наявної бази кольорів!");
  }

  const selectedColors = RandomizeArray(COLORS_DB).slice(0, numPairs);
  let cards = [];

  selectedColors.forEach((color, index) => {
    const colorCard = {
      id: `${index}_color`,
      pairId: index,
      type: "color",
      colorName: color.name,
      rgb: color.rgb,
      isMatched: false,
      isFlipped: false,
    };

    //доступні формати
    const availableFormats = [];
    if (Array.isArray(color.rgb)) availableFormats.push("rgb");
    if (Array.isArray(color.hsv)) availableFormats.push("hsv");
    if (Array.isArray(color.cmy)) availableFormats.push("cmy");

    const randomFormat =
      availableFormats[Math.floor(Math.random() * availableFormats.length)];
    const formatValue = color[randomFormat];

    const textCard = {
      id: `${index}_text`,
      pairId: index,
      type: "text",
      colorName: color.name,
      valueFormat: randomFormat,
      value: formatValue,
      isMatched: false,
      isFlipped: false,
    };

    cards.push(colorCard, textCard);
  });

  return RandomizeArray(cards);
}

document.addEventListener("DOMContentLoaded", () => {
  const resultScreen = document.getElementById("result-screen");
  resultScreen.style.display = "none";
});

const gameBoard = document.getElementById("game-board");
const timerElement = document.getElementById("timer");

const foundPairsElement = document.getElementById("pairs-found");
const totalPairsElement = document.getElementById("total-pairs");

let FLIPPED_CARDS = [];
let FOUNDED_PAIRS = 0;
let TOTAL_PAIRS = 6;
let TIMER = null;
let secondsElapsed = 0;

function startTimer() {
  secondsElapsed = 0;
  timerElement.textContent = "00:00";
  TIMER = setInterval(() => {
    secondsElapsed++;
    let mins = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
    let secs = String(secondsElapsed % 60).padStart(2, "0");

    document.getElementById("timer").textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(TIMER);
}

function RenderCards(hamsterFoto) {
  gameBoard.innerHTML = "";
  totalPairsElement.textContent = TOTAL_PAIRS;

  const cards = CreateCards(TOTAL_PAIRS);

  cards.forEach((card) => {
    const cardElem = document.createElement("div");
    cardElem.classList.add("card");
    cardElem.dataset.id = card.id;
    cardElem.dataset.colorName = card.colorName;

    // const cardBackContent = card.type === "color"
    //   ? `<div class="card-back" style="background-color: rgb(${card.rgb.join(",")});"></div>`
    //   : `<div class="card-back text-card" style="background-color: white; color: black; display: flex; align-items: center; justify-content: center;">
    //        rgb(${card.rgb.join(", ")})
    //      </div>`;

    const cardBackContent =
      card.type === "color"
        ? `<div class="card-back" style="background-color: rgb(${card.rgb.join(
            ","
          )});"></div>`
        : `<div class="card-back text-card" style="background-color: white; color: black; display: flex; align-items: center; justify-content: center;">
       ${card.valueFormat}(${card.value.join(", ")})
     </div>`;

    cardElem.innerHTML = `
  <div class="card-inner">
    <div class="card-front">
      <img src="${hamsterTypePNG[hamsterFoto]}" alt="hamster" class="hamster-icon" />
    </div>
    ${cardBackContent}
  </div>
`;

    cardElem.addEventListener("click", () => onCardClick(cardElem, card));
    gameBoard.appendChild(cardElem);
  });
}

function onCardClick(cardElem, card) {
  if (FLIPPED_CARDS.length >= 2) return;
  if (card.isMatched) return;
  if (FLIPPED_CARDS.find((c) => c.elem === cardElem)) return;

  // Перевернути картку
  cardElem.classList.add("flipped");
  FLIPPED_CARDS.push({ elem: cardElem, data: card });

  if (FLIPPED_CARDS.length === 2) {
    checkForMatch();
  }
}

function handleGameWin() {
  const params = new URLSearchParams(window.location.search);
  const hamsterType = params.get("theme");
  console.log("Game won with hamster type:", hamsterType);
  const gifPath = hamsterTypeGif[hamsterType];

  setTimeout(() => {
    const board = document.querySelector(".game-board");
    board.classList.add("hidden");

    setTimeout(() => {
      const resultScreen = document.getElementById("result-screen");
      const finalMessage = document.getElementById("final-message");
      const finalTime = document.getElementById("final-time");
      const hamsterImg = document.getElementById("hamster-gif");

      finalMessage.textContent =
        MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      finalTime.textContent = timerElement.textContent;
      hamsterImg.src = gifPath;

      resultScreen.style.display = "block";
      gameBoard.style.display = "none";
    }, 1000);
  }, 1000);
}

function checkForMatch() {
  const [first, second] = FLIPPED_CARDS;

  if (first.data.colorName === second.data.colorName) {
    // Пара знайдена
    first.data.isMatched = true;
    second.data.isMatched = true;
    FOUNDED_PAIRS++;
    foundPairsElement.textContent = FOUNDED_PAIRS;
    FLIPPED_CARDS = [];

    setTimeout(() => {
      first.elem.classList.add("matched-style");
      second.elem.classList.add("matched-style");
    }, 500);

    if (FOUNDED_PAIRS === TOTAL_PAIRS) {
      stopTimer();
      handleGameWin();
    }
  } else {
    // Не співпало
    setTimeout(() => {
      first.elem.classList.remove("flipped");
      second.elem.classList.remove("flipped");
      FLIPPED_CARDS = [];
    }, 1000);
  }
}

function GetNumPairs(difficulty) {
  var size;
  var fontSizePx;
  var numPairs = 0;
  switch (difficulty) {
    case "easy":
      size = "150px";
      gameBoard.style.maxWidth = "900px";
      gameBoard.style.gap = "20px";
      fontSizePx = "16px";
      numPairs = 5;
      break;
    case "medium":
      gameBoard.style.maxWidth = "1000px";
      gameBoard.style.gap = "20px";
      size = "150px";
      fontSizePx = "16px";
      numPairs = 9;
      break;
    case "hard":
      size = "120px";
      gameBoard.style.maxWidth = "1100px";
      gameBoard.style.gap = "10px";
      fontSizePx = "13px";
      numPairs = 16;
      break;
    default:
      size = "150px";
      gameBoard.style.maxWidth = "900px";
      gameBoard.style.gap = "20px";
      fontSizePx = "16px";
      numPairs = 5;
      break;
  }

  gameBoard.style.gridTemplateColumns = `repeat(auto-fit, minmax(${size}, 1fr))`;
  document.documentElement.style.setProperty("--card-size", size);
  document.documentElement.style.setProperty(
    "--text-card-font-size",
    fontSizePx + "px"
  );
  return numPairs;
}

// Запуск гри
function startGame() {
  const params = new URLSearchParams(window.location.search);
  const difficulty = params.get("difficulty");
  const theme = params.get("theme");

  console.log(difficulty, theme);

  console.log("START");
  TOTAL_PAIRS = GetNumPairs(difficulty);
  FOUNDED_PAIRS = 0;

  RenderCards(theme);
  startTimer();
}

startGame();
