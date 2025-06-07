import { auth } from "./firebase-config.js";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const getElement = document.querySelector.bind(document);

class User {
  constructor(form) {
    this.nameElem = form.userName;
    this.surnameElem = form.userSurname;
    this.emailElem = form.userEmail;
    this.phoneElem = form.userPhoneNumber;
    this.passwordElem = form.userPasswordRegister;
    this.passwordRepeatElem = form.userPasswordRepeat;
  }

  isValid() {
    return (
      checkUserName(this.nameElem) &&
      checkUserSurname(this.surnameElem) &&
      checkEmail(this.emailElem) &&
      checkPhoneNumber(this.phoneElem) &&
      checkPassword(this.passwordElem) &&
      checkPasswordMatch(this.passwordElem, this.passwordRepeatElem)
    );
  }

  get email() {
    return this.emailElem.value;
  }

  get password() {
    return this.passwordElem.value;
  }

  toJSON() {
    return {
      name: this.nameElem.value,
      surname: this.surnameElem.value,
      email: this.emailElem.value,
      phone: this.phoneElem.value,
      registeredAt: serverTimestamp(),
    };
  }

  saveToDatabase(uid) {
    const userRef = doc(db, "users", uid);
    const dataToSave = this.toJSON();
    console.log(
      "Attempting to save to Firestore. UID:",
      uid,
      "Data:",
      dataToSave
    );

    setDoc(userRef, dataToSave)
      .then(() => {
        console.log("User data successfully saved to Firestore for UID:", uid);
      })
      .catch((error) => {
        console.error("Firestore write error for UID:", uid, "Error:", error);
      });
  }

  saveToLocalStorage() {
    const userData = this.toJSON();
    localStorage.setItem("currentUser", JSON.stringify(userData));
    console.log("User data saved to localStorage.");
  }
}

const error_text = getElement("#error-text");
const error_text_main = getElement("#error-text-main");

function loadAuthModal() {
  changeDisplayFlex(getElement("#wrapper-shadow"));
  changeDisplayFlex(getElement("#modal-register"));

  if (isLogin) {
    formAuthModal.userName.style.display = "none";
    formAuthModal.userSurname.style.display = "none";
    formAuthModal.userPhoneNumber.style.display = "none";
    formAuthModal.userPasswordRegister.style.display = "none";
    formAuthModal.userPasswordRepeat.style.display = "none";
    formAuthModal.userPasswordLogin.style.display = "block";
    getElement("#modal-auth-h3").textContent = "Увійти";
    formAuthModal.buttonLoginIn.style.display = "block";
    formAuthModal.buttonSignIn.style.display = "none";
  } else {
    formAuthModal.userName.style.display = "block";
    formAuthModal.userSurname.style.display = "block";
    formAuthModal.userPhoneNumber.style.display = "block";
    formAuthModal.userPasswordRegister.style.display = "block";
    formAuthModal.userPasswordRepeat.style.display = "block";
    formAuthModal.userPasswordLogin.style.display = "none";
    getElement("#modal-auth-h3").textContent = "Зареєструватися";
    formAuthModal.buttonSignIn.style.display = "block";
    formAuthModal.buttonLoginIn.style.display = "none";
  }
}

window.openMoreInfo = function (element) {
  const wrapper = element.closest(".question-item-wraper");
  const answer = wrapper.querySelector(".answer-item");
  const img = element.querySelector("img");
  const isVisible = window.getComputedStyle(answer).display === "block";
  if (isVisible) {
    wrapper.style.height = "80px";
    answer.style.display = "none";
    answer.classList.remove("answer-item-active");
    img.classList.remove("rotate");
  } else {
    wrapper.style.height = "200px";
    answer.style.display = "block";
    answer.classList.add("answer-item-active");
    img.classList.add("rotate");
  }
};

window.closeModal = function () {
  getElement("#wrapper-shadow").style.display = "none";
  getElement("#modal-register").style.display = "none";
  // changeDisplayFlex(getElement("#wrapper-shadow"));
  // changeDisplayFlex(getElement("#modal-register"));
  error_text.textContent = "";
  error_text_main.textContent = "";
  formAuthModal.userName.style.borderColor = "var(--primary-color)";
  formAuthModal.userSurname.style.borderColor = "var(--primary-color)";
  formAuthModal.userPhoneNumber.style.borderColor = "var(--primary-color)";
  formAuthModal.userPasswordRegister.style.borderColor = "var(--primary-color)";
  formAuthModal.userPasswordRepeat.style.borderColor = "var(--primary-color)";
  formAuthModal.userPasswordLogin.style.borderColor = "var(--primary-color)";
  formAuthModal.userEmail.style.borderColor = "var(--primary-color)";
};

document.getElementById("sign-in-button").addEventListener("click", () => {
  console.log("hi");
  openModalRegister();
});

document.getElementById("start-course").addEventListener("click", () => {
  console.log("hi");
  openModalRegister();
});


function openModalRegister() {
  isRegister = true;
  isLogin = false;
  loadAuthModal();
}

window.openModalLogin = function () {
  isRegister = false;
  isLogin = true;
  loadAuthModal();
};

window.checkUserName = function (elem) {
  let errors = [];
  const regexp =
    /^(?!Ь)[А-ЩЮЯІЇЄҐ][а-щьюяіїєґ]*(?:'[а-щьюяіїєґ]+)?[а-щьюяіїєґ]*(?:-[А-ЩЮЯІЇЄҐ][а-щьюяіїєґ]*(?:'[а-щьюяіїєґ]+)?[а-щьюяіїєґ]*)*$/;

  if (!regexp.test(elem.value)) {
    elem.style.borderColor = "red";
    errors.push("Ім’я містить недопустимі символи.");
  }

  console.log(error_text_main);
  const parts = elem.value.split("-");

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Перевірка на мінімальну довжину (3 символи)
    if (part.replace(/'/g, "").length < 3) {
      error_text.textContent = `Частина "${part}" має містити щонайменше 3 букви.`;
      error_text_main.textContent = `Частина "${part}" має містити щонайменше 3 букви.`;
      return false;
    }

    // Перевірка першої літери
    if (!/^[А-ЩЮЯІЇЄҐ]/.test(part)) {
      error_text.textContent = `Частина "${part}" повинна починатися з великої української літери.`;
      error_text_main.textContent = `Частина "${part}" повинна починатися з великої української літери.`;
      return false;
    }

    // Не повинна починатися чи закінчуватись апострофом
    if (/^'/.test(part) || /'$/.test(part)) {
      error_text.textContent = `У частині "${part}" апостроф не може бути на початку або в кінці.`;
      error_text_main.textContent = `У частині "${part}" апостроф не може бути на початку або в кінці.`;
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
        error_text_main.textContent = `У частині "${part}" апостроф має бути між українськими літерами.`;
        return false;
      }
    }
  }
  error_text.textContent = "";
  error_text_main.textContent = "";
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

    // Перевірка на мінімальну довжину (3 символи)
    if (part.replace(/'/g, "").length < 3) {
      error_text.textContent = `Частина "${part}" має містити щонайменше 3 букви.`;
      error_text_main.textContent = `Частина "${part}" має містити щонайменше 3 букви.`;
      return false;
    }

    // Перевірка першої літери
    if (!/^[А-ЩЮЯІЇЄҐ]/.test(part)) {
      error_text.textContent = `Частина "${part}" повинна починатися з великої української літери.`;
      error_text_main.textContent = `Частина "${part}" повинна починатися з великої української літери.`;
      return false;
    }

    // Не повинна починатися чи закінчуватись апострофом
    if (/^'/.test(part) || /'$/.test(part)) {
      error_text.textContent = `У частині "${part}" апостроф не може бути на початку або в кінці.`;
      error_text_main.textContent = `У частині "${part}" апостроф не може бути на початку або в кінці.`;
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
        error_text_main.textContent = `У частині "${part}" апостроф має бути між українськими літерами.`;
        return false;
      }
    }
  }
  error_text.textContent = "";
  error_text_main.textContent = "";
  elem.style.borderColor = "var(--primary-color)";
  return true;
};

window.checkEmail = function (elem) {
  const errors = [];

  elem.style.borderColor = "red";

  // Основна структура: ім'я@домен
  const emailParts = elem.value.split("@");
  if (emailParts.length !== 2) {
    error_text.textContent = "Email повинен містити один символ '@'.";
    error_text_main.textContent = "Email повинен містити один символ '@'.";
    return false;
  }

  const localPart = emailParts[0];
  const domainPart = emailParts[1];

  // Перевірка на допустимі символи в першій частині (латиниця, цифри, _ . -)
  if (!/^[a-zA-Z0-9._-]+$/.test(localPart)) {
    error_text.textContent =
      "Перша частина email може містити лише латинські букви, цифри, крапки, дефіси або підкреслення.";
    error_text_main.textContent =
      "Перша частина email може містити лише латинські букви, цифри, крапки, дефіси або підкреслення.";
    return false;
  }

  // Заборонити подвійні крапки або початок/кінець з крапки
  if (
    /\.{2,}/.test(localPart) ||
    localPart.startsWith(".") ||
    localPart.endsWith(".")
  ) {
    error_text.textContent =
      "Крапки у першій частині не можуть бути на початку, в кінці або йти підряд.";
    error_text_main.textContent =
      "Крапки у першій частині не можуть бути на початку, в кінці або йти підряд.";
    return false;
  }

  // Дозволені домени
  const allowedDomains = ["gmail.com", "ukr.net", "lpnu.ua"];
  if (!allowedDomains.includes(domainPart)) {
    error_text.textContent = `Дозволені лише домени: ${allowedDomains.join(
      ", "
    )}.`;
    error_text_main.textContent = `Дозволені лише домени: ${allowedDomains.join(
      ", "
    )}.`;
    return false;
  }

  error_text.textContent = "";
  error_text_main.textContent = "";
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
    error_text_main.textContent =
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
    error_text_main.textContent =
      "Номер повинен містити 10 цифр після коду країни (тобто формат 0XXYYYYYYY).";
    return false;
  }

  // Перевірка, чи починається з 0
  if (!coreNumber.startsWith("0")) {
    error_text.textContent = "Основна частина номера повинна починатися з 0.";
    error_text_main.textContent =
      "Основна частина номера повинна починатися з 0.";
    return false;
  }

  error_text.textContent = "";
  error_text_main.textContent = "";
  elem.style.borderColor = "var(--primary-color)";
  return true;
};

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

window.checkPasswordMatch = function (password, elem) {
  const errors = [];

  // Перевірка на збіг паролів
  if (password.value !== elem.value) {
    error_text.textContent =
      "Паролі не збігаються. Будь ласка, введіть їх ще раз.";
    error_text_main.textContent =
      "Паролі не збігаються. Будь ласка, введіть їх ще раз.";
    return false;
  }

  error_text.textContent = "";
  error_text_main.textContent = "";
  elem.style.borderColor = "var(--primary-color)";
  return true;
};

window.registerUser = function (nameForm) {
  const user = new User(nameForm);

  if (user.isValid()) {
    createUserWithEmailAndPassword(auth, user.email, user.password)
      .then((userCredential) => {
        const createdUser = userCredential.user;
        const uid = createdUser.uid;
        console.log("Registered with Auth:", createdUser.email, "UID:", uid);
        console.log(user);
        user.saveToDatabase(uid);
        user.saveToLocalStorage();
        setTimeout(() => {
          location.href = "./main.html";
        }, 1000); // 1000 мс = 1 секунда

        closeModal();
      })
      .catch((error) => {
        console.error("Auth registration error:", error.code, error.message);
        error_text.textContent =
          "Користувач з таким емейлом вже існує або інша помилка реєстрації.";
        error_text_main.textContent =
          "Користувач з таким емейлом вже існує або інша помилка реєстрації.";
      });
  } else {
    console.log("Form data is not valid. User not registered.");
  }
};

window.loginInUser = function () {
  const email = formAuthModal.userEmail.value;
  const password = formAuthModal.userPasswordLogin.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const uid = user.uid;
      console.log("Signed in:", user.email);

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        localStorage.setItem("currentUser", JSON.stringify(userData));
        console.log("User data loaded and saved to localStorage:", userData);
        location.href = "./main.html";
      } else {
        console.error("No user data found in Firestore.");
      }
    })
    .catch((error) => {
      console.error(error.code, error.message);
      error_text.textContent = "Неправильний емейл або логін";
    });
};
