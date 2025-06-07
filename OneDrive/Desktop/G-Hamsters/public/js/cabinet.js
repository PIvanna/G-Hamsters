import { RegisterUser } from "./mainPage.js";
import { Notification } from "./mainPage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";

import {
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const error_text = document.getElementById("error-text");
const error_text_main = document.getElementById("error_text_main");
let myProgress = 25; // Відсоток успішності
const barData = []; // Прогрес за модулями (0–100)
let lineData = []; // Активність за тиждень/місяць (0–50)

const formUser = {
  name: document.getElementById("name"),
  surname: document.getElementById("surname"),
  phone: document.getElementById("phone"),
};

window.checkUserName = function (elem) {
  let errors = [];
  const regexp =
    /^(?!Ь)[А-ЩЮЯІЇЄҐ][а-щьюяіїєґ]*(?:'[а-щьюяіїєґ]+)?[а-щьюяіїєґ]*(?:-[А-ЩЮЯІЇЄҐ][а-щьюяіїєґ]*(?:'[а-щьюяіїєґ]+)?[а-щьюяіїєґ]*)*$/;

  if (!regexp.test(elem.value)) {
    elem.style.borderColor = "red";
    errors.push("Ім’я містить недопустимі символи.");
  }

  const parts = elem.value.split("-");
  console.log(elem);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (/[a-zA-Z]/.test(elem.value)) {
      elem.style.borderColor = "red";
      error_text.textContent = "Ім’я не може містити латинські літери.";
      return false;
    }

    // Перевірка на мінімальну довжину (3 символи)
    if (part.replace(/'/g, "").length < 3) {
      error_text.textContent = `Частина "${part}" має містити щонайменше 3 букви.`;
      return false;
    }

    // Перевірка першої літери
    if (!/^[А-ЩЮЯІЇЄҐ]/.test(part)) {
      error_text.textContent = `Частина "${part}" повинна починатися з великої української літери.`;
      return false;
    }

    // Не повинна починатися чи закінчуватись апострофом
    if (/^'/.test(part) || /'$/.test(part)) {
      error_text.textContent = `У частині "${part}" апостроф не може бути на початку або в кінці.`;
      return false;
    }

    // Апостроф має бути лише перед малою українською літерою
    const apostrophes = [...part.matchAll(/'/g)];
    for (const match of apostrophes) {
      const pos = match.index;
      if (pos === 0 || pos === part.length - 1) continue; // вже перевірили
      const before = part[pos - 1];
      const after = part[pos + 1];
      if (!/[а-щьюяіїєґ]/.test(before) || !/[а-щьюяіїєґ]/.test(after)) {
        error_text.textContent = `У частині "${part}" апостроф має бути між українськими літерами.`;
        return false;
      }
    }
  }
  error_text.textContent = "";
  elem.style.borderColor = "var(--primary-color)";
  return true;
};

window.checkUserSurname = function (elem) {
  let errors = [];
  const regexp =
    /^(?!Ь)[А-ЩЮЯІЇЄҐ][а-щьюяіїєґ]*(?:'[а-щьюяіїєґ]+)?[а-щьюяіїєґ]*(?:-[А-ЩЮЯІЇЄҐ][а-щьюяіїєґ]*(?:'[а-щьюяіїєґ]+)?[а-щьюяіїєґ]*)*$/;

  if (!regexp.test(elem.value)) {
    elem.style.borderColor = "red";
    errors.push("Ім’я містить недопустимі символи.");
  }

  console.log(error_text);
  const parts = elem.value.split("-");

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (/[a-zA-Z]/.test(elem.value)) {
      elem.style.borderColor = "red";
      error_text.textContent = "Ім’я не може містити латинські літери.";
      return false;
    }

    // Перевірка на мінімальну довжину (3 символи)
    if (part.replace(/'/g, "").length < 3) {
      error_text.textContent = `Частина "${part}" має містити щонайменше 3 букви.`;
      return false;
    }

    // Перевірка першої літери
    if (!/^[А-ЩЮЯІЇЄҐ]/.test(part)) {
      error_text.textContent = `Частина "${part}" повинна починатися з великої української літери.`;
      return false;
    }

    // Не повинна починатися чи закінчуватись апострофом
    if (/^'/.test(part) || /'$/.test(part)) {
      error_text.textContent = `У частині "${part}" апостроф не може бути на початку або в кінці.`;
      return false;
    }

    // Апостроф має бути лише перед малою українською літерою
    const apostrophes = [...part.matchAll(/'/g)];
    for (const match of apostrophes) {
      const pos = match.index;
      if (pos === 0 || pos === part.length - 1) continue; // вже перевірили
      const before = part[pos - 1];
      const after = part[pos + 1];
      if (!/[а-щьюяіїєґ]/.test(before) || !/[а-щьюяіїєґ]/.test(after)) {
        error_text.textContent = `У частині "${part}" апостроф має бути між українськими літерами.`;
        return false;
      }
    }
  }
  error_text.textContent = "";
  elem.style.borderColor = "var(--primary-color)";
  return true;
};

window.checkPhoneNumber = function (elem) {
  const errors = [];
  elem.style.borderColor = "red";

  // Прибрати всі пробіли
  const trimmed = elem.value.trim();

  // Перевірка символів — лише допустимі
  if (!/^\+?\d+$/.test(trimmed)) {
    error_text.textContent =
      "Номер телефону повинен містити лише цифри, дозволено '+' на початку.";
    return false;
  }

  // Забрати + на початку для аналізу
  const digitsOnly = trimmed.startsWith("+") ? trimmed.slice(1) : trimmed;

  // Має починатися з 38 або 0
  if (!(digitsOnly.startsWith("38") || digitsOnly.startsWith("0"))) {
    error_text.textContent = "Номер повинен починатися з +38, 38 або 0.";
    return false;
  }

  // Витягуємо останні 10 цифр
  let coreNumber = "";
  if (digitsOnly.startsWith("38")) {
    coreNumber = digitsOnly.slice(2);
  } else if (digitsOnly.startsWith("0")) {
    coreNumber = digitsOnly;
  }

  // Перевірка довжини
  if (coreNumber.length !== 10) {
    error_text.textContent =
      "Номер повинен містити 10 цифр після коду країни (тобто формат 0XXYYYYYYY).";
    return false;
  }

  // Перевірка, чи починається з 0
  if (!coreNumber.startsWith("0")) {
    error_text.textContent = "Основна частина номера повинна починатися з 0.";
    return false;
  }

  error_text.textContent = "";
  elem.style.borderColor = "var(--primary-color)";
  return true;
};

const editNameBtn = document.getElementById("edit-name-btn");
const editSurnameBtn = document.getElementById("edit-surname-btn");
const editPhoneBtn = document.getElementById("edit-phone-btn");
let userInstance;

if (editNameBtn) {
  editNameBtn.addEventListener("click", async () => {
    if (checkUserName(formUser.name)) {
      userInstance.name = formUser.name.value;

      userInstance.saveToLocalStorage();

      try {
        await userInstance.updateFieldsInFirestore({
          name: userInstance.name,
        });
        console.log("Ім'я успішно оновлено:", userInstance.name);
      } catch (err) {
        console.error("Помилка оновлення Firestore:", err);
      }
    }
  });
}

if (editSurnameBtn) {
  editSurnameBtn.addEventListener("click", async () => {
    if (checkUserSurname(formUser.surname)) {
      userInstance.surname = formUser.surname.value;

      userInstance.saveToLocalStorage();

      try {
        await userInstance.updateFieldsInFirestore({
          surname: userInstance.surname,
        });
        console.log("Ім'я успішно оновлено:", userInstance.surname);
      } catch (err) {
        console.error("Помилка оновлення Firestore:", err);
      }
    }
  });
}

if (editPhoneBtn) {
  editPhoneBtn.addEventListener("click", async () => {
    if (checkPhoneNumber(formUser.phone)) {
      userInstance.phone = formUser.phone.value;

      userInstance.saveToLocalStorage();

      try {
        await userInstance.updateFieldsInFirestore({
          phone: userInstance.phone,
        });
        console.log("Ім'я успішно оновлено:", userInstance.phone);
      } catch (err) {
        console.error("Помилка оновлення Firestore:", err);
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const currentUserData = localStorage.getItem("currentUser");

  if (currentUserData) {
    try {
      const userObject = JSON.parse(currentUserData);
      userInstance = new RegisterUser(userObject);
      console.log(userInstance);

      formUser.name.value = userInstance.name || "";
      formUser.surname.value = userInstance.surname || "";
      formUser.phone.value = userInstance.phone || "";

      // 🎯 Обробка вибору темпу навчання
      const paceOptions = document.querySelectorAll(".pace-option");
      const selectedTemp = userInstance.temp || "normal";

      paceOptions.forEach((option) => {
        const temp = option.getAttribute("data-temp");

        // Встановити правильний обраний темп
        if (temp === selectedTemp) {
          option.classList.add("selected");
        } else {
          option.classList.remove("selected");
        }

        // Додати обробник кліку
        option.addEventListener("click", () => {
          paceOptions.forEach((opt) => opt.classList.remove("selected"));
          option.classList.add("selected");

          // Зберегти новий темп
          userInstance.temp = temp;
          userInstance.saveToLocalStorage();
          userInstance.updateFieldsInFirestore({ temp: temp });

          console.log(`Темп оновлено до: ${temp}`);
        });

        const statistic = userInstance.updateStatistics();
        myProgress = statistic.completionRate;
        console.log(statistic);

        for (let i = 1; i <= statistic.totalModules; i++) {
          const key = `module${i}`;
          if (statistic[key] !== undefined) {
            barData.push(statistic[key]);
          } else {
            barData.push(0); // Якщо відсутній — 0%
          }
        }

        lineData = getVisitsArray(userInstance.visits, 7);

        updateBarChart(barData);
        updateLineChart(lineData);

        updateProgressCircle(myProgress);
      });
    } catch (err) {
      console.error("Помилка парсингу currentUser:", err);
    }
  } else {
    console.log("currentUser відсутній у localStorage.");
  }
});

window.checkPassword = function (elem) {
  elem.style.borderColor = "red";
  // Мінімальна довжина
  if (elem.value.length < 8) {
    error_text.textContent = "Пароль повинен містити щонайменше 8 символів.";
    error_text_main.textContent =
      "Пароль повинен містити щонайменше 8 символів.";
    return false;
  }

  // Дозволені лише англійські букви, цифри, _ і \
  if (!/^[a-zA-Z0-9_\\]+$/.test(elem.value)) {
    error_text.textContent =
      "Пароль може містити лише англійські літери, цифри, символи '_' та '\\'.";
    error_text_main.textContent =
      "Пароль може містити лише англійські літери, цифри, символи '_' та '\\'.";
    return false;
  }

  error_text.textContent = "";
  error_text_main.textContent = "";
  elem.style.borderColor = "var(--primary-color)";
  return true;
};

const changePasswordBtn = document.querySelector(".change-password-btn");
const modal = document.getElementById("change-password-modal");
const cancelBtn = document.getElementById("cancel-password-change");
const confirmBtn = document.getElementById("confirm-password-change");

changePasswordBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

confirmBtn.addEventListener("click", async () => {
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;

  if (!currentPassword || !newPassword) {
    alert("Будь ласка, заповніть обидва поля!");
    return;
  }

  try {
    const user = auth.currentUser;

    if (!user || !user.email) {
      alert("Користувач не авторизований.");
      return;
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    if (checkPassword(document.getElementById("new-password")) === false) {
      alert("Пароль не відповідає вимогам.");
      return;
    }

    // Переавторизація
    await reauthenticateWithCredential(user, credential);

    // Зміна пароля
    await updatePassword(user, newPassword);

    alert("Пароль успішно оновлено!");
    modal.style.display = "none";
  } catch (error) {
    console.error("Помилка зміни пароля:", error);
    alert("Помилка: " + error.message);
  }
});

const paceOptions = document.querySelectorAll(".pace-option");

paceOptions.forEach((option) => {
  option.addEventListener("click", async () => {
    paceOptions.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");

    const selectedTempo = option.dataset.temp;

    const user = RegisterUser.fromLocalStorage();
    if (!user) {
      console.error("❌ Користувач не знайдений у localStorage");
      return;
    }

    user.temp = selectedTempo;

    user.saveToLocalStorage();

    try {
      await user.updateFieldsInFirestore({ temp: selectedTempo });
      console.log(`✅ Темп "${selectedTempo}" збережено для користувача.`);
    } catch (e) {
      console.error("❌ Помилка збереження темпу в Firestore:", e);
    }
  });
});

function updateProgressCircle(percentage) {
  const circle = document.getElementById("progressCircle");
  const text = document.querySelector(".progress-text");

  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  const offset = circumference - (percentage / 100) * circumference;
  circle.style.strokeDashoffset = offset;

  text.textContent = `${percentage}%`;
}

// Функція оновлення бар-чарту (прогрес по модулях)
function updateBarChart(dataArray) {
  const bars = document.querySelectorAll(".bar");
  bars.forEach((bar, index) => {
    if (dataArray[index] !== undefined) {
      bar.style.height = `${dataArray[index]}%`;
    }
  });
}

// Функція оновлення лінійного графіка
function updateLineChart(values) {
  const svg = document.querySelector(".line-chart-svg");
  const maxVal = 50; // Висота SVG по осі Y
  const width = 100;
  const stepX = width / (values.length - 1);

  console.log(values);
  // Знаходимо максимальне значення з масиву, щоб нормалізувати
  const maxDataVal = Math.max(...values);

  const points = values.map((val, i) => {
    const x = i * stepX + 5;
    // Масштабуємо val до діапазону [0..maxVal]
    const scaledVal = (val / maxDataVal) * maxVal;
    // Інвертуємо Y (0 - зверху, maxVal - знизу)
    const y = maxVal - scaledVal;
    return `${x},${y}`;
  });

  // Оновлюємо лінію
  const polyline = svg.querySelector("polyline");
  polyline.setAttribute("points", points.join(" "));

  // Видаляємо старі точки
  svg.querySelectorAll("circle").forEach((c) => c.remove());

  // Додаємо точки
  values.forEach((val, i) => {
    const cx = i * stepX + 5;
    const scaledVal = (val / maxDataVal) * maxVal;
    const cy = maxVal - scaledVal;
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("class", "point");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", 2.5);
    svg.appendChild(circle);
  });
}

// 🧪 Тестові дані

// 🔄 Оновлюємо візуалізацію

function getVisitsArray(visitsObj, daysCount = 7) {
  const result = [];
  const today = new Date();
  console.log(visitsObj);
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push(visitsObj[key] || 0);
  }

  return result;
}

const tabButtons = document.querySelectorAll(".tab-button");
const leaderboardTable = document.querySelector(".leaderboard-table tbody");

let moduleData = {};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Активуємо вибраний таб
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    button.classList.remove("inactive");

    // Отримуємо назву модуля
    const moduleName = button.textContent.trim();

    // Очищаємо старі рядки таблиці
    leaderboardTable.innerHTML = "";

    // Додаємо нові рядки з даних модуля
    const data = moduleData[moduleName] || [];
    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <td class="rank-col">${row.rank}</td>
            <td class="player-col">${row.player}</td>
            <td class="score-col">${row.score}</td>
          `;
      leaderboardTable.appendChild(tr);
    });
  });
});


async function fetchAllUsers() {
  const usersCollection = collection(db, "users");
  const querySnapshot = await getDocs(usersCollection);

  const users = [];

  querySnapshot.forEach((docSnap) => {
    const userData = docSnap.data();
    userData.uid = docSnap.id;
    const user = new RegisterUser(userData);
    users.push(user);
  });

  return users;
}

fetchAllUsers()
  .then((users) => {
    const resultsByUser = users.map((user) => {
      const modules = user.progress.modules || [];
      const moduleScores = modules.map((m) => ({
        moduleName: m.name,
        score: m.test?.score || 0,
      }));
      const totalScore = moduleScores.reduce((sum, m) => sum + m.score, 0);

      return {
        name: user.name || "Unknown",
        uid: user.uid,
        moduleScores,
        totalScore,
      };
    });

    const sortedTotal = [...resultsByUser].sort(
      (a, b) => b.totalScore - a.totalScore
    );

    const moduleNames = new Set();
    resultsByUser.forEach((user) =>
      user.moduleScores.forEach((m) => moduleNames.add(m.moduleName))
    );

    // Створюємо moduleData
    moduleData["Загальний"] = sortedTotal.map((user, index) => ({
      rank: index + 1,
      player: user.name,
      score: user.totalScore,
    }));

    moduleNames.forEach((moduleName) => {
      const moduleResults = resultsByUser
        .map((user) => {
          const moduleScore = user.moduleScores.find(
            (m) => m.moduleName === moduleName
          );
          return {
            name: user.name,
            score: moduleScore?.score || 0,
          };
        })
        .sort((a, b) => b.score - a.score);

      moduleData[moduleName] = moduleResults.map((res, idx) => ({
        rank: idx + 1,
        player: res.name,
        score: res.score,
      }));
    });

    // Встановлюємо обробники кнопок тільки після заповнення moduleData
    const tabButtons = document.querySelectorAll(".tab-button");
    const leaderboardTable = document.querySelector(".leaderboard-table tbody");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        button.classList.remove("inactive");

        const moduleName = button.textContent.trim();

        leaderboardTable.innerHTML = "";

        const data = moduleData[moduleName] || [];
        data.forEach((row) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
                <td class="rank-col">${row.rank}</td>
                <td class="player-col">${row.player}</td>
                <td class="score-col">${row.score}</td>
              `;
          leaderboardTable.appendChild(tr);
        });
      });
    });

    // Можливо, одразу показати загальний рейтинг?
    document.querySelector(".tab-button.active")?.click();
  })
  .catch((error) => {
    console.error("Помилка:", error);
  });


// Додай таблиці по модулях
// moduleNames.forEach((moduleName) => {
//   const moduleResults = resultsByUser
//     .map((user) => {
//       const moduleScore = user.moduleScores.find(
//         (m) => m.moduleName === moduleName
//       );
//       return {
//         name: user.name,
//         score: moduleScore?.score || 0,
//       };
//     })
//     .sort((a, b) => b.score - a.score);

//   moduleData[moduleName] = moduleResults.map((res, idx) => ({
//     rank: idx + 1,
//     player: res.name,
//     score: res.score,
//   }));
// });