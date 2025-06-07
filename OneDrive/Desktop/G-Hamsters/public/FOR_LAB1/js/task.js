

function drawPartTest1(step) {
  switch (step) {
    case 0:
      // Стіни
      c.fillStyle = "#d3d3d3";
      c.fillRect(STEP * 3, canvas.height - STEP * 5, STEP * 4, STEP * 3);
      break;
    case 1:
      // Двері
      c.fillStyle = "#654321";
      c.fillRect(STEP * 4, canvas.height - STEP * 4, STEP, STEP * 2);
      break;
    case 2:
      // Вікно
      c.fillStyle = "#87ceeb";
      c.fillRect(STEP * 5.5, canvas.height - STEP * 4, STEP, STEP);
      break;
    case 3:
      // Трава
      c.fillStyle = "green";
      c.fillRect(0, canvas.height - STEP * 2, canvas.width, STEP);
      break;
    case 4:
      // Дах
      c.beginPath();
      c.moveTo(STEP * 2, canvas.height - STEP * 5);
      c.lineTo(STEP * 5, canvas.height - STEP * 7);
      c.lineTo(STEP * 8, canvas.height - STEP * 5);
      c.closePath();
      c.fillStyle = "#a52a2a";
      c.fill();
      break;
    default:
      break;
  }
}

function drawPartTest2(step) {
  switch (step) {
    case 0:
      c.fillStyle = "#dfd3ba"; // колір стін
      c.fillRect(STEP * 2.5, canvas.height - STEP * 5, STEP * 5, STEP * 3); // x, y, ширина, висота
console.log("Draw test 2 step 1");
      break;
    case 1:
      c.beginPath();
      c.moveTo(STEP * 2, canvas.height - STEP * 5);
      c.lineTo(STEP * 5, canvas.height - STEP * 7);
      c.lineTo(STEP * 8, canvas.height - STEP * 5);
      c.closePath();
      c.fillStyle = "#040080"; // коричневий дах
      c.fill();
      console.log("Draw test 2 step 2");

      break;
    case 2:
      c.fillStyle = "#0062c7 "; // темно-коричневий
      c.fillRect(STEP * 4.5, canvas.height - STEP * 4, STEP, STEP * 2);

      c.beginPath();
      c.arc(STEP * 5.4, canvas.height - STEP*3, 5, 0, 2 * Math.PI);
      c.fillStyle = "gold";
      c.fill();
      console.log("Draw test 2 step 3");
      break;
    case 3:
      c.fillStyle = "#87ceeb"; // блакитний
      c.fillRect(STEP * 3.2, canvas.height - STEP * 4, STEP, STEP);
      c.fillRect(STEP * 5.8, canvas.height - STEP * 4, STEP, STEP);
      console.log("Draw test 2 step 4");
      break;
    case 4:
      c.strokeStyle = "#ffffff";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(STEP * 3.2 + STEP / 2, canvas.height - STEP * 4);
      c.lineTo(STEP * 3.2 + STEP / 2, canvas.height - STEP * 3);
      c.moveTo(STEP * 3.2, canvas.height - STEP * 3.5);
      c.lineTo(STEP * 4.2, canvas.height - STEP * 3.5);
      c.stroke();

      c.beginPath();
      c.moveTo(STEP * 5.8 + STEP / 2, canvas.height - STEP * 4);
      c.lineTo(STEP * 5.8 + STEP / 2, canvas.height - STEP * 3);
      c.moveTo(STEP * 5.8, canvas.height - STEP * 3.5);
      c.lineTo(STEP * 6.8, canvas.height - STEP * 3.5);
      c.stroke();
      console.log("Draw test 2 step 5");
      break;
    case 5:
     // ☀ Сонце
      c.beginPath();
      c.arc(STEP * 2, STEP*2, STEP, 0, Math.PI * 2);
      c.fillStyle = "yellow";
      c.fill();

      console.log("Draw test 2 step 6");

      break;
    case 6:
      // Димар
      c.fillStyle = "#444";
      c.fillRect(STEP * 6.5, canvas.height - STEP * 6.5, STEP / 2, STEP);

      // Дим (кола)
      c.globalAlpha = 0.3;
      c.fillStyle = "grey";
      c.beginPath();
      c.arc(STEP * 6.75, canvas.height - STEP * 7, 8, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(STEP * 6.8, canvas.height - STEP * 7.5, 10, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(STEP * 7.1, canvas.height - STEP * 8.1, 14, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = 1;
      console.log("Draw test 2 step 7");

      break;
    case 7:
       c.fillStyle = "green";
      c.fillRect(0, canvas.height - STEP*2, canvas.width, STEP);
      break;
    default:
      break;
  }
}

function drawPartTest3(step){
switch(step){
  case 0:
    c.lineWidth = 2;
      c.strokeStyle = '#000';
       c.fillStyle = '#0057a3';
      c.fillRect(0, canvas.height - STEP * 2, canvas.width, STEP);
      c.stroke();
     
    break;
  case 1:
     c.fillStyle = '#f5e0b7';
      c.beginPath();
      c.moveTo(STEP * 5, canvas.height - STEP * 8);
      c.lineTo(STEP * 3.5, canvas.height - STEP * 4);
      c.lineTo(STEP * 5, canvas.height - STEP * 4);
      c.closePath();
      c.fill();
      c.stroke();

    break;

     case 2:
      c.fillStyle = '#f5e0a1';
         c.beginPath();
      c.moveTo(STEP * 5, canvas.height - STEP * 7);
      c.lineTo(STEP * 5, canvas.height - STEP * 4);
      c.lineTo(STEP * 6.5, canvas.height - STEP * 4);
      c.closePath();
      c.fill();
      c.stroke();
     
    break;

     case 3:
       c.fillStyle = '#f18d2d';
      c.beginPath();
      c.arc(canvas.width - STEP * 1.5, STEP * 1.2, STEP * 0.8, 0, 2 * Math.PI);
      c.fill();
      c.stroke();
    break;

     case 4:
       c.beginPath();
    c.moveTo(STEP * 5, canvas.height - STEP * 4);
    c.lineTo(STEP * 5, canvas.height - STEP * 3);
    c.stroke();
    break;

     case 5:
       c.fillStyle = '#a16d00';   // правильний fillStyle
    c.beginPath();
    c.moveTo(STEP *3.5 , canvas.height - STEP*2);
    c.lineTo(STEP *3, canvas.height - STEP*3);
    c.lineTo(STEP *7.5, canvas.height - STEP * 3);
     c.lineTo(STEP *7 , canvas.height - STEP*2);
    c.closePath();
    c.fill();
    c.strokeStyle = '#000';
    c.lineWidth = 2;
    c.stroke();
    break;
    default:
      break
}


   
}

function DrawPartTest(testName, step){
  if(testName =="test1"){
    drawPartTest1(step);
    console.log("from 1");

  }else if (testName=="test2"){
    drawPartTest2(step);
      console.log("from 2");
  }else if(testName == "test3"){
    drawPartTest3(step);
  }
}





let CORRECT_ANSWER_COUNT = 0;
let CURRENT_TASK = 0;
let MAX_LIVES = 3;

let SECONDS = 0;
let TIMER_ID = null;
const TIMER = document.getElementById("timer");

document.getElementById("results-container-wrap").style.display = "none";
const nextBtn = document.getElementById("btn-next-task");
document.getElementById("retry-btn").style.display = "none";
document.getElementById("btn-next-task").style.display = "none";

function StartQuiz(selectedTest) {
  document.getElementById("task-container").style.display = "block";
  document.getElementById("results-container-wrap").style.display = "none";
  document.getElementById("btn-next-task").textContent = "Наступне питання";
  ReDrawBoard();
   //c.clearRect(0, 0, canvas.width, canvas.height);

  SECONDS = 0;
  if (TIMER_ID === null) {
    startTimer();
  }
  CORRECT_ANSWER_COUNT = 0;
  CURRENT_TASK = 0;
  MAX_LIVES = 3;

  RenderTask(selectedTest, CURRENT_TASK);
  DrawPartTest(testName, CURRENT_TASK);
}

function RandomeMix(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function RenderTask(test, taskIndex) {
  const task = selectedTest.questions[taskIndex];

  const taskDiv = document.getElementById("task");
  if (!taskDiv) return;

  document.getElementById("task-num").innerHTML = `Завдання ${taskIndex + 1}`;
  taskDiv.querySelector("h4").innerHTML = task.question;

  const container = taskDiv.querySelector("div");
  container.innerHTML = ""; // очищення попередніх варіантів

  const optionsShuffled = RandomeMix([...task.options]);

//task.options.forEach((opt) => {
  optionsShuffled.forEach((opt) => {
    const label = document.createElement("label");
    label.className = "answer-container";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answers";
    input.className = "custom-radio";
    input.dataset.correct = opt.correct; // можна використати для перевірки

    input.addEventListener("change", () => {
      // Зняти виділення з усіх
      const allLabels = container.querySelectorAll(".answer-container");
      allLabels.forEach((lbl) => lbl.classList.remove("selected"));

      // Додати виділення до поточного
      if (input.checked) {
        label.classList.add("selected");
      }
    });

    const p = document.createElement("p");
    p.innerHTML = opt.code;

    label.appendChild(input);
    label.appendChild(p);
    container.appendChild(label);
  });
}

document.getElementById("action-btn").addEventListener("click", () => {
  const taskDiv = document.getElementById(`task`);
  const selectedInput = taskDiv.querySelector("input[type=radio]:checked");
  const feedbackDiv = document.getElementById("feedback");
  const retryBtn = document.getElementById("retry-btn");
  const checkBtn = document.getElementById("action-btn");

  if (!selectedInput) {
    feedbackDiv.innerHTML = "⚠️ Будь ласка, оберіть одну відповідь.";
    return;
  }

  const isCorrect = selectedInput.dataset.correct === "true";

  if (isCorrect) {
    CORRECT_ANSWER_COUNT++;
    feedbackDiv.innerHTML = "✅ Правильно!";
    nextBtn.style.display = "block";
    checkBtn.style.display = "none";
    // nextStep(); // Переходимо далі
  } else {
    MAX_LIVES--;
    if (MAX_LIVES > 0) {
      feedbackDiv.innerHTML = `❌ Помилка! У тебе залишилось ${MAX_LIVES} ${GetLivesText(
        MAX_LIVES
      )}.`;
      retryBtn.style.display = "block";
      checkBtn.style.display = "none";
    } else {
      feedbackDiv.innerHTML = `❌ Усі життя втрачені. <br>`;
      checkBtn.style.display = "none";
      nextBtn.style.display = "block";
      nextBtn.textContent = "Завершити тест";
    }
  }
});

function RetryTask() {
  const inputs = document.querySelectorAll(`#task input[type=radio]`);
  inputs.forEach((inp) => (inp.checked = false));

  const labels = document.querySelectorAll(`#task .answer-container`);
  labels.forEach((label) => {
    label.classList.remove("selected");
  });

  document.getElementById("feedback").innerHTML = "";
  document.getElementById("retry-btn").style.display = "none";
  document.getElementById("action-btn").style.display = "block";
}

function NextStep() {
  document.getElementById("btn-next-task").style.display = "none";
  document.getElementById("action-btn").style.display = "block";
  document.getElementById("feedback").innerHTML = "";

  CURRENT_TASK++;

  if (CURRENT_TASK >= selectedTest.questions.length || MAX_LIVES == 0) {
    stopTimer();
    const timeStr = TIMER.textContent;
    showResults(
      CORRECT_ANSWER_COUNT,
      3 - MAX_LIVES,
      selectedTest.questions.length,
      timeStr
    );
  } else {
    RenderTask(selectedTest, CURRENT_TASK);
  }

  if (CURRENT_TASK == selectedTest.questions.length - 1) {
    nextBtn.innerHTML = "Завершити тест";
  }

  // drawPartTest1(CURRENT_TASK);
   DrawPartTest(testName, CURRENT_TASK);
}

function GetLivesText(num) {
  if (num === 1) return "життя";
  if (num === 2 || num === 3 || num === 4) return "життя";
  return "життів";
}

function showResults(correctCount, errorCount, totalCount, timeStr) {
  const resultsContainer = document.getElementById("results-container");

  document.getElementById("task-container").style.display = "none";
  document.getElementById("results-container-wrap").style.display = "block";

  const maxLives = 3;
  const livesLeft = Math.max(0, maxLives - errorCount);
  const heartIcons = "❤️".repeat(livesLeft) + "🖤".repeat(maxLives - livesLeft);

  const secondsUsed = timeStringToSeconds(timeStr);

  var percentScore = 100;

  if (MAX_LIVES != 3) {
    if (correctCount < totalCount) {
      percentScore = (correctCount / totalCount) * 100;
    }
    if (correctCount == totalCount) {
      percentScore -= (errorCount / totalCount) * 100;
    }
  }

  if (secondsUsed > 120) {
    const penalty = Math.floor((secondsUsed - 120) / 10);
    percentScore -= penalty;
  }

  resultsContainer.innerHTML = `
        <h1>Результати</h1>
        <div class="results-box">
            <div class="circle-container">
                <svg class="circle" viewBox="0 0 36 36">
                    <circle class="circle-bg" cx="18" cy="18" r="16"></circle>
                    <circle class="circle-progress" cx="18" cy="18" r="16" stroke-dasharray="100" stroke-dashoffset="${
                      100 - percentScore
                    }"></circle>
                </svg>
                <span class="percent">${  percentScore.toFixed(2)}%</span>
            </div>
            <div class="hearts">${heartIcons}</div>
             <p class="time">⏱️ Час проходження: <strong>${timeStr}</strong></p>

            <p class="emoji">${getEmojiFeedback(percentScore)}</p>
        </div>

        <div class="button-row">
  <button onclick="StartQuiz()">Спробувати ще раз</button>
  <button><a href="index.html" class="home">До меню</a></button>
</div>
        
         `;

  const results = {
    correctCount: correctCount,
    errorCount: errorCount,
    totalCount: totalCount,
    percentScore: percentScore,
    timeInSeconds: secondsUsed,
  };

  console.log(results);
}

function getEmojiFeedback(percent) {
  if (percent == 100) {
    return "🏆 Ідеально! Ти справжній профі!";
  }
  if (percent >= 90) {
    return "🎉 Вражаючий результат! Ти майже дійшов до ідеалу!";
  }
  if (percent >= 80) {
    return "👏 Гарна робота! Ти дуже близько до досконалості!";
  }
  if (percent >= 70) {
    return "🙂 Чудово, але є місце для поліпшення!";
  }
  if (percent >= 50) {
    return "🤔 Можна краще! Залишилось трохи до успіху.";
  }
  if (percent >= 30) {
    return "😓 Ти на правильному шляху, але ще потрібно попрактикуватися!";
  }
  return "😅 Не засмучуйся, спробуй ще! Ти обов'язково здобудеш перемогу!";
}

function timeStringToSeconds(timeStr) {
  const [minutes, seconds] = timeStr.split(":").map(Number);
  return minutes * 60 + seconds;
}

function updateTimer() {
  SECONDS++;

  let hrs = Math.floor(SECONDS / 3600);
  let mins = Math.floor((SECONDS % 3600) / 60);
  let secs = SECONDS % 60;

  // Форматування з провідними нулями
  const format = (num) => num.toString().padStart(2, "0");

  TIMER.textContent = `${format(mins)}:${format(secs)}`;
}

function startTimer() {
  SECONDS = 0;
  TIMER.textContent = `00:00`;

  TIMER_ID = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (TIMER_ID !== null) {
    clearInterval(TIMER_ID);
    TIMER_ID = null;
  }
}

const params = new URLSearchParams(window.location.search);
const testName = params.get("test");

const selectedTest = TESTS_MAP.get(testName);
console.log("test NAME = " + testName);


if (selectedTest) {
  
  StartQuiz(selectedTest); // передай його у свою логіку
} else {
  alert("Тест не знайдено.");
}
