import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { db, auth } from "./firebase-config.js";

const tempoSchedule = {
  slow: [1, 2, 3, 4], // 1 год, 2 год, ...
  normal: [0.5, 1, 2, 3], // 30 хв, 1 год, ...
  fast: [0.25, 0.5, 1, 2], // 15 хв, 30 хв, ...
};

let quizQuestions;
let userProgress;
window.correctAnswers = 0;

export class RegisterUser {
  constructor(data) {
    this.uid = data.uid || null;
    this.name = data.name;
    this.surname = data.surname;
    this.email = data.email;
    this.phone = data.phone;
    this.registeredAt = data.registeredAt;
    this.temp = data.temp || "normal";
    this.progress =
      data.progress instanceof UserProgress
        ? data.progress
        : UserProgress.fromData(data.progress || []);
    this.notifications = (() => {
      if (data.notifications instanceof NotificationManager) {
        return data.notifications;
      } else if (Array.isArray(data.notifications)) {
        return new NotificationManager(data.notifications);
      } else {
        return new NotificationManager([]);
      }
    })();
    this.generatedOffsets = data.generatedOffsets || [];
    this.visits =
      typeof data.visits === "object" && data.visits !== null
        ? data.visits
        : {};
  }

  static fromLocalStorage() {
    const dataString = localStorage.getItem("currentUser");
    if (!dataString) return null;

    try {
      const data = JSON.parse(dataString);
      data.progress = UserProgress.fromData(data.progress || []);
      data.notifications = new NotificationManager(data.notifications || []);

      return new RegisterUser(data);
    } catch (e) {
      console.error("Помилка парсингу currentUser з localStorage:", e);
      localStorage.removeItem("currentUser");
      return null;
    }
  }

  toJSON() {
    return {
      uid: this.uid,
      name: this.name,
      surname: this.surname,
      email: this.email,
      phone: this.phone,
      registeredAt: this.registeredAt,
      temp: this.temp,
      progress: this.progress.toJSON(),
      notifications:
        this.notifications instanceof NotificationManager
          ? this.notifications.toJSON()
          : new NotificationManager(this.notifications || []).toJSON(), // fallback
      generatedOffsets: this.generatedOffsets || [],
      visits: this.visits || 0,
    };
  }

  updateStatistics() {
    const totalModules = this.progress.modules.length;

    // Створюємо об'єкт із ключами module1, module2... та відсотками
    const modulesProgressPercents = {};

    this.progress.modules.forEach((module, index) => {
      const key = `module${index + 1}`;
      modulesProgressPercents[key] = getProgressPercent(module);
    });

    // Загальний прогрес як середнє відсотків
    const totalProgress = Object.values(modulesProgressPercents).reduce(
      (sum, p) => sum + p,
      0
    );
    const completionRate = totalModules > 0 ? totalProgress / totalModules : 0;

    let statistics = {
      totalModules,
      completedModules: this.progress.modules.filter((m) => m.isCompleted())
        .length,
      completionRate: Math.round(completionRate),
      ...modulesProgressPercents, // додаємо поля module1, module2, ... в statistics
    };

    return statistics;
  }

  incrementVisits() {
    const today = new Date().toISOString().slice(0, 10); // формат YYYY-MM-DD

    if (!this.visits[today]) {
      this.visits[today] = 0;
    }
    this.visits[today]++;

    this.saveToLocalStorage();
    if (this.uid) {
      this.updateFieldsInFirestore({ visits: this.visits });
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem("currentUser", JSON.stringify(this.toJSON()));
    } catch (e) {
      console.error(
        "Помилка збереження currentUser (з прогресом) в localStorage:",
        e
      );
    }
  }

  updateProgress(progressData) {
    if (progressData instanceof UserProgress) {
      this.progress = progressData;
    } else {
      this.progress = UserProgress.fromData(progressData || []);
    }
  }

  static async fetchFromDatabaseByEmail(email) {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const userData = docSnap.data();
      userData.uid = docSnap.id;
      return new RegisterUser(userData);
    } else {
      throw new Error("User not found in Firestore");
    }
  }

  static async ensureInitialized(uid) {
    const userRef = doc(db, "users", uid);
    let snap = await getDoc(userRef);

    if (!snap.exists()) {
      console.warn("Користувач не знайдений у Firestore (ensureInitialized).");
      return null;
    }

    let firestoreUserData = snap.data();

    // Якщо прогресу ще немає — ініціалізувати
    if (!firestoreUserData.progress) {
      const initialProgressObject = initializeModulesProgress();
      const progressForFirestore = initialProgressObject.toJSON();

      await updateDoc(userRef, {
        progress: progressForFirestore,
        lastUpdated: serverTimestamp(),
      });

      snap = await getDoc(userRef);
      if (snap.exists()) {
        firestoreUserData = snap.data();
      } else {
        console.error(
          "Неможливо перезавантажити дані користувача після ініціалізації прогресу."
        );
        return null;
      }
    }

    const localCurrentUserInstance = RegisterUser.fromLocalStorage();
    if (localCurrentUserInstance && localCurrentUserInstance.uid === uid) {
      let instanceUpdated = false;
      for (const key in firestoreUserData) {
        if (Object.prototype.hasOwnProperty.call(firestoreUserData, key)) {
          const firestoreValue = firestoreUserData[key];
          let needsUpdate = false;

          if (!(key in localCurrentUserInstance)) {
            needsUpdate = true;
          } else if (key === "progress") {
            if (
              localCurrentUserInstance.progress &&
              typeof localCurrentUserInstance.progress.toJSON === "function"
            ) {
              if (
                JSON.stringify(localCurrentUserInstance.progress.toJSON()) !==
                JSON.stringify(firestoreValue)
              ) {
                needsUpdate = true;
              }
            } else {
              if (firestoreValue !== undefined) needsUpdate = true;
            }
          } else {
            if (
              JSON.stringify(localCurrentUserInstance[key]) !==
              JSON.stringify(firestoreValue)
            ) {
              needsUpdate = true;
            }
          }

          if (needsUpdate) {
            if (key === "progress") {
              localCurrentUserInstance.updateProgress(firestoreValue);
            } else if (key === "notifications") {
              localCurrentUserInstance.notifications = new NotificationManager(
                firestoreValue || []
              );
            } else if (key === "generatedOffsets") {
              localCurrentUserInstance.generatedOffsets = firestoreValue || [];
            } else {
              localCurrentUserInstance[key] = firestoreValue;
            }
            instanceUpdated = true;
          }
        }
      }

      if (instanceUpdated) {
        localCurrentUserInstance.saveToLocalStorage();
      }
    } else {
      // 🔧 Фікс: Приводимо notifications до NotificationManager
      if (
        !firestoreUserData.notifications ||
        !Array.isArray(firestoreUserData.notifications)
      ) {
        firestoreUserData.notifications = [];
      }
      firestoreUserData.notifications = new NotificationManager(
        firestoreUserData.notifications
      );

      const newCurrentUserInstance = new RegisterUser(firestoreUserData);
      newCurrentUserInstance.saveToLocalStorage();
    }

    if (localStorage.getItem("userProgress")) {
      localStorage.removeItem("userProgress");
    }

    return firestoreUserData.progress
      ? UserProgress.fromData(firestoreUserData.progress)
      : new UserProgress([]);
  }

  async updateFieldsInFirestore(fieldsToUpdate) {
    if (!this.uid) {
      throw new Error("Неможливо оновити дані: відсутній UID користувача.");
    }

    const userRef = doc(db, "users", this.uid);

    try {
      await updateDoc(userRef, {
        ...fieldsToUpdate,
        lastUpdated: serverTimestamp(),
      });
      console.log(
        "Дані користувача успішно оновлено у Firestore:",
        fieldsToUpdate
      );

      Object.keys(fieldsToUpdate).forEach((key) => {
        if (key === "progress") {
          this.updateProgress(fieldsToUpdate[key]);
        } else if (key === "notifications") {
          this.notifications = new NotificationManager(
            fieldsToUpdate[key] || []
          );
        } else {
          this[key] = fieldsToUpdate[key];
        }
      });

      this.saveToLocalStorage();
    } catch (error) {
      console.error(
        "Помилка при оновленні даних користувача у Firestore:",
        error
      );
      throw error;
    }
  }
}

export class NotificationManager {
  constructor(notifications = []) {
    this.notifications = Notification.fromDataArray(notifications);
  }

  addNotification(notificationData) {
    const newNotification = new Notification(notificationData);
    this.notifications.unshift(newNotification);
  }

  toJSON() {
    return this.notifications.map((n) =>
      n instanceof Notification ? n.toJSON() : new Notification(n).toJSON()
    );
  }

  static fromData(data) {
    return new NotificationManager(data);
  }

  saveToLocalStorage() {
    const localUser = RegisterUser.fromLocalStorage();
    if (localUser) {
      localUser.notifications = this;
      localUser.saveToLocalStorage();
    }
  }
}

export class Notification {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.message = data.message || "";
    this.type = data.type || "info";
    this.timestamp = data.timestamp || new Date().toISOString();
    this.read = data.read !== undefined ? data.read : false;
  }

  static fromDataArray(dataArray = []) {
    return dataArray.map((data) => new Notification(data));
  }

  toJSON() {
    return {
      id: this.id,
      message: this.message,
      type: this.type,
      timestamp: this.timestamp,
      read: this.read,
    };
  }

  static async addNotificationToUser(userId, notification) {
    const userRef = doc(db, "users", userId);
    const notifObj =
      notification instanceof Notification
        ? notification.toJSON()
        : new Notification(notification).toJSON();

    try {
      await updateDoc(userRef, {
        notifications: arrayUnion(notifObj),
      });
      console.log("Сповіщення додано користувачу.");
    } catch (e) {
      console.error("Помилка при додаванні сповіщення:", e);
    }
  }

  static async markAsRead(userId, notificationId) {
    const userRef = doc(db, "users", userId);
    const localUser = RegisterUser.fromLocalStorage();

    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("Користувача не знайдено");

      const data = userSnap.data();

      // 🔁 Оновлюємо локальний об'єкт NotificationManager
      const currentManager = new NotificationManager(data.notifications || []);
      currentManager.notifications = currentManager.notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      );

      // 🧠 Оновлюємо локального користувача
      localUser.notifications = currentManager;

      // 💾 Синхронізуємо в Firestore
      await localUser.updateFieldsInFirestore({
        notifications: currentManager.toJSON(),
      });

      console.log("Сповіщення позначено як прочитане.");
    } catch (e) {
      console.error("Помилка при оновленні сповіщення:", e);
    }
  }

  static async removeNotificationFromUser(userId, notification) {
    try {
      const localUser = RegisterUser.fromLocalStorage();
      if (!localUser) {
        throw new Error("Користувач не знайдений у localStorage");
      }

      // Фільтруємо сповіщення
      const manager = localUser.notifications;
      manager.notifications = manager.notifications.filter(
        (n) => n.id !== notification.id
      );

      // Оновлюємо в Firestore через updateFieldsInFirestore
      await localUser.updateFieldsInFirestore({
        notifications: manager.toJSON(),
      });

      console.log("Сповіщення видалено.");
    } catch (e) {
      console.error("Помилка при видаленні сповіщення:", e);
    }
  }
}

export class Question {
  constructor({ id, text, type, options = [], correctAnswer, points = 1 }) {
    this.id = id;
    this.text = text;
    this.type = type;
    this.options = options;
    this.correctAnswer = correctAnswer;
    this.points = points;
  }

  isCorrect(userAnswer) {
    if (this.type === "open") {
      return (
        String(userAnswer).trim().toLowerCase() ===
        String(this.correctAnswer[0]).trim().toLowerCase()
      );
    }
    if (this.type === "single") {
      return userAnswer === this.correctAnswer[0];
    }
    if (this.type === "multiple") {
      const correct = [...this.correctAnswer].sort();
      const answer = [...userAnswer].sort();
      return (
        Array.isArray(userAnswer) &&
        correct.length === answer.length &&
        correct.every((v, i) => v === answer[i])
      );
    }
    return false;
  }
}

export class Answer {
  constructor({ questionId, userAnswer, isCorrect = false, pointsEarned = 0 }) {
    this.questionId = questionId;
    this.userAnswer = userAnswer !== undefined ? userAnswer : null;
    this.isCorrect = isCorrect;
    this.pointsEarned = pointsEarned;
  }

  evaluate(question) {
    this.isCorrect = question.isCorrect(this.userAnswer);
    this.pointsEarned = this.isCorrect ? question.points : 0;
  }

  toJSON() {
    return {
      questionId: this.questionId,
      userAnswer: this.userAnswer,
      isCorrect: this.isCorrect,
      pointsEarned: this.pointsEarned,
    };
  }

  static fromData(data = {}) {
    if (!data || typeof data !== "object") {
      console.warn("Answer.fromData received invalid data:", data);
      return new Answer();
    }
    return new Answer({
      questionId: data.questionId,
      userAnswer: data.userAnswer,
      isCorrect: data.isCorrect,
      pointsEarned: data.pointsEarned,
    });
  }
}

export class Test {
  constructor(data = {}) {
    this.id =
      data.id ||
      `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.startedAt = data.startedAt || null;
    this.finishedAt = data.finishedAt || null;
    this.answers = {};
    if (data.answers) {
      Object.keys(data.answers).forEach((qId) => {
        this.answers[qId] = Answer.fromData(data.answers[qId]);
      });
    }
    this.score = data.score || 0;
    this.maxScore = data.maxScore || 0;
    this.passed = data.passed || false;
  }

  start() {
    if (!this.startedAt) {
      this.startedAt = new Date().toISOString();
      this.finishedAt = null;
      this.answers = {};
      this.score = 0;
      this.passed = false;
    }
  }

  addAnswer(answerInstance) {
    if (answerInstance instanceof Answer && answerInstance.questionId) {
      this.answers[answerInstance.questionId] = answerInstance;
    } else {
      console.error(
        "Invalid answerInstance provided to Test.addAnswer:",
        answerInstance
      );
    }
  }

  finish(questionsArray = []) {
    if (this.finishedAt) {
      console.warn("Тест вже завершено. Повторний виклик finish ігнорується.");
      return;
    }
    this.finishedAt = new Date().toISOString();
    this.calculateScore(questionsArray);
  }

  calculateScore(questionsArray = []) {
    let currentScore = 0;
    let currentMaxScore = 0;

    Object.values(this.answers).forEach((answerInstance) => {
      currentScore += answerInstance.pointsEarned || 0;
    });

    if (questionsArray && questionsArray.length > 0) {
      questionsArray.forEach((q) => {
        currentMaxScore += q.points || 0;
      });
    } else {
      console.warn(
        "questionsArray не передано або порожній в calculateScore. maxScore може бути неточним, якщо не встановлений інакше."
      );
      currentMaxScore = this.maxScore || 0;
      if (currentMaxScore === 0 && Object.keys(this.answers).length > 0) {
        console.warn(
          "Trying to deduce maxScore from answered questions' points."
        );
        Object.values(this.answers).forEach((ans) => {
          const qData = window.questions.find((q) => q.id === ans.questionId);
          if (qData) currentMaxScore += qData.points || 0;
        });
      }
    }

    this.score = currentScore;
    this.maxScore = currentMaxScore > 0 ? currentMaxScore : this.maxScore;
  }

  getDurationMs() {
    if (!this.startedAt || !this.finishedAt) return 0;
    try {
      return (
        new Date(this.finishedAt).getTime() - new Date(this.startedAt).getTime()
      );
    } catch (e) {
      return 0;
    }
  }

  getCorrectAnswersCount() {
    return Object.values(this.answers).filter((ans) => ans.isCorrect).length;
  }

  reset() {
    this.startedAt = null;
    this.finishedAt = null;
    this.answers = {};
    this.score = 0;
    this.passed = false;
    console.log("Test has been reset.");
  }

  toJSON() {
    const answersAsJson = {};
    for (const qId in this.answers) {
      if (
        this.answers.hasOwnProperty(qId) &&
        this.answers[qId] instanceof Answer
      ) {
        answersAsJson[qId] = this.answers[qId].toJSON();
      }
    }
    return {
      id: this.id,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      answers: answersAsJson,
      score: this.score,
      maxScore: this.maxScore,
      passed: this.passed,
    };
  }

  static fromData(data = {}) {
    const test = new Test();
    test.id = data.id || test.id;
    test.startedAt = data.startedAt || null;
    test.finishedAt = data.finishedAt || null;
    test.score = data.score || 0;
    test.maxScore = data.maxScore || 0;
    test.passed = data.passed || false;
    test.answers = {};

    if (data.answers && typeof data.answers === "object") {
      Object.keys(data.answers).forEach((qId) => {
        if (data.answers[qId]) {
          test.answers[qId] = Answer.fromData(data.answers[qId]);
        }
      });
    }
    return test;
  }
}

export class Module {
  constructor({
    id,
    name,
    theoryCompleted = false,
    test = null,
    miniGameUnlocked = false,
    RedactorUnlocked = false,
    completedAt = null,
    started = false,
    description,
    url,
  }) {
    this.id = id;
    this.name = name;
    this.theoryCompleted = theoryCompleted;
    this.test = test ? Test.fromData(test) : new Test();
    this.miniGameUnlocked = miniGameUnlocked;
    this.RedactorUnlocked = RedactorUnlocked;
    this.completedAt = completedAt;
    this.started = started;
    this.description = description;
    this.url = url;
  }

  isCompleted() {
    return this.theoryCompleted && this.test?.passed;
  }

  unlockMiniGame() {
    if (this.isCompleted()) {
      this.miniGameUnlocked = true;
    }
  }

  start() {
    this.started = true;
    this.test?.start();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      theoryCompleted: this.theoryCompleted,
      test: this.test.toJSON(),
      miniGameUnlocked: this.miniGameUnlocked,
      RedactorUnlocked: this.RedactorUnlocked,
      completedAt: this.completedAt,
      started: this.started,
      description: this.description,
      url: this.url,
    };
  }

  static fromData(data) {
    return new Module(data);
  }

  static fromLocalStorage(moduleId) {
    if (!moduleId) {
      console.error("Module.fromLocalStorage: moduleId не надано.");
      return null;
    }
    const dataString = localStorage.getItem(`module_${moduleId}`);
    if (!dataString) {
      console.warn(
        `Module.fromLocalStorage: Дані для модуля ${moduleId} не знайдено.`
      );
      return null;
    }

    try {
      const data = JSON.parse(dataString);
      return new Module(data);
    } catch (e) {
      console.error(
        `Помилка парсингу даних модуля ${moduleId} з localStorage:`,
        e
      );
      localStorage.removeItem(`module_${moduleId}`);
      return null;
    }
  }
}

export class UserProgress {
  constructor(modules = []) {
    if (!modules || modules.length === 0) {
      this.modules = initializeModulesProgress().modules;
    } else {
      this.modules = modules.map((m) => new Module(m));
    }
  }

  getModuleById(id) {
    return this.modules.find((m) => m.id === id);
  }

  unlockNextModule(currentModuleId) {
    const index = this.modules.findIndex((m) => m.id === currentModuleId);
    const next = this.modules[index + 1];
    if (next && this.modules[index].isCompleted()) {
      next.start();
    }
  }

  toJSON() {
    return this.modules.map((module) => module.toJSON());
  }

  static fromData(modulesData) {
    if (
      !modulesData ||
      !Array.isArray(modulesData) ||
      modulesData.length === 0
    ) {
      return initializeModulesProgress();
    }
    return new UserProgress(modulesData);
  }
}

async function loadProgressFromFirestore(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const firestoreData = snap.data();

    const localUser = RegisterUser.fromLocalStorage();
    if (localUser && localUser.uid === uid) {
      let updated = false;
      for (const key in firestoreData) {
        if (Object.prototype.hasOwnProperty.call(firestoreData, key)) {
          const firestoreValue = firestoreData[key];
          let needsUpdate = false;

          if (!(key in localUser)) {
            needsUpdate = true;
          } else if (key === "progress") {
            if (
              localUser.progress &&
              typeof localUser.progress.toJSON === "function"
            ) {
              if (
                JSON.stringify(localUser.progress.toJSON()) !==
                JSON.stringify(firestoreValue)
              ) {
                needsUpdate = true;
              }
            } else {
              if (firestoreValue !== undefined) needsUpdate = true;
            }
          } else {
            if (
              JSON.stringify(localUser[key]) !== JSON.stringify(firestoreValue)
            ) {
              needsUpdate = true;
            }
          }

          if (needsUpdate) {
            if (key === "progress") {
              localUser.updateProgress(firestoreValue);
            } else if (key === "notifications") {
              localUser.notifications = new NotificationManager(
                firestoreValue || []
              );
            } else {
              localUser[key] = firestoreValue;
            }
            updated = true;
          }
        }
      }

      if (updated) {
        localUser.saveToLocalStorage();
      }
    } else {
      // 🔧 Створюємо нового локального користувача з правильним типом notifications
      if (
        !firestoreData.notifications ||
        !Array.isArray(firestoreData.notifications)
      ) {
        firestoreData.notifications = [];
      }
      firestoreData.notifications = new NotificationManager(
        firestoreData.notifications
      );

      const newUser = new RegisterUser(firestoreData);
      newUser.saveToLocalStorage();
    }

    return UserProgress.fromData(firestoreData.progress || []);
  } else {
    console.error(
      `User document with UID ${uid} not found in Firestore. Cannot load progress.`
    );
    throw new Error(
      `User document for UID ${uid} not found. Unable to load progress.`
    );
  }
}

function initializeModulesProgress() {
  const defaultModules = [
    {
      id: "module1",
      name: "Модуль 1",
      description:
        "Основи векторної (математичної) та растрової (піксельної) графіки, їх відмінності та застосування.",
      url: "module1.html",
    },
    {
      id: "module2",
      name: "Модуль 2",
      description: "Плавні криві Безьє, їх створення та використання.",
      url: "module2.html",
    },
    {
      id: "module3",
      name: "Модуль 3",
      description:
        "Вивчення фракталів: типи, генерація та їх застосування у графіці для реалістичних зображень.",
      url: "module3.html",
    },
    {
      id: "module4",
      name: "Модуль 4",
      description:
        "Системи представлення кольорів для точного відтворення на екранах та у друці.",
      url: "module4.html",
    },
    {
      id: "module5",
      name: "Модуль 5",
      description:
        "Маніпуляція об'єктами через афінні перетворення та моделювання поверхонь для тривимірної графіки.",
      url: "module5.html",
    },
  ];

  return new UserProgress(
    defaultModules.map((mod, index) => ({
      ...mod,
      theoryCompleted: false,
      test: {},
      miniGameUnlocked: false,
      RedactorUnlocked: false,
      completedAt: null,
      started: index === 0,
    }))
  );
}

function initializeGame() {
  const defaultGames = [
    {
      id: "game1",
      name: "Конструктор",
      description: "Побудова картинки",
      img: "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Fpuzzle%201.png?alt=media&token=5ba09152-cc32-42a9-a598-b38dcaea7b50",
      url: "/FOR_LAB1/index.html",
      color: "#bae2ff",
    },
    {
      id: "game2",
      name: "М'ячик",
      description: "Проектування кривою Безьє",
      img: "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Ffootball%20ball%201.png?alt=media&token=c70b04fb-1f6d-434f-b0c9-055fb2560ecb",
      url: "/Snake/index.html",
      color: "#ffd75e",
    },
    {
      id: "game3",
      name: "Пазли",
      description: "Зображення фракталів",
      url: "/puzzle/main-window.html",
      img: "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Fcube%201.png?alt=media&token=b19a8534-87ad-4e58-ae5b-5ddf1465ce83",
      color: "#ffd2cd",
    },
    {
      id: "game4",
      name: "Кольори",
      description: "Системи + колір",
      url: "/Colors_GAME/main.html",
      img: "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Fbrain%201.png?alt=media&token=077bc3ef-1eeb-4696-976c-94a9cc9fb8c6",
      color: "#ffcb80",
    },
    {
      id: "game5",
      name: "Тетріс",
      description: "Просто тетріс",
      url: "/tetris/index.html",
      img: "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Fflag%201.png?alt=media&token=062851ef-8db7-4fb1-b3b3-90de7adad6d0",
      color: "#b2edcf",
    },
  ];
  return defaultGames;
}

function initializeRedactor() {
  const defaultRedactors = [
    {
      id: "redactor1",
      name: "Редактор",
      description: "Геометричних фігур",
      img: "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Ffigures%201.png?alt=media&token=fb120e15-246e-478a-b088-7d1c2a0598d1",
      url: "/figure-redactor/index.html",
      color: "#569df5",
    },
    {
      id: "redactor2",
      name: "Редактор",
      description: "Кривої Безьє",
      img: "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Fcurve%201.png?alt=media&token=fef4d0f2-b178-4a60-8b7f-66b122b691f2",
      url: "/KG_Lab_02-main/index.html",
      color: "#9796e2",
    },
    {
      id: "redactor3",
      name: "Редактор",
      description: "Фракталів",
      url: "/Fractal-Explorer-main/algebraic.html",
      img: "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Ffractal%201.png?alt=media&token=ac1715a3-2f3d-4189-98ad-620e8e9994dd",
      color: "#45bcbc",
    },
    {
      id: "redactor4",
      name: "Редактор",
      description: "Колірних схем",
      url: "/CG_Lab4/index.html",
      img: "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Fcolor-schema%201.png?alt=media&token=bc2eab20-2758-46ef-a080-86e6f03ef605",
      color: "#fed1a3",
    },
    {
      id: "redactor5",
      name: "Редактор",
      description: "Афінних перетворень",
      url: "/afini-redactor/index.html",
      img: "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Fgraphics%201.png?alt=media&token=5b97d426-648f-4b33-99ea-3727e435dae4",
      color: "#FFD0CD",
    },
  ];
  return defaultRedactors;
}

function tryStartNextModule(modules, currentModuleId) {
  console.log(modules);
  const currentIndex = modules.findIndex((m) => m.id === currentModuleId);
  console.log(currentIndex);
  if (currentIndex === -1 || currentIndex === modules.length - 1) return;

  const currentModule = modules[currentIndex];
  const nextModule = modules[currentIndex + 1];
  console.log(nextModule);
  console.log(currentModule);

  if (currentModule.isCompleted() && !nextModule.started) {
    console.log(nextModule);
    nextModule.start();
    nextModule.test.startedAt = null;
    console.log(`Наступний модуль (ID: ${nextModule.id}) розпочато.`);
  } else {
    console.log("Наступний модуль вже почато або попередній не завершено.");
  }
}

function renderGames(userProgress) {
  const container = document.querySelector(".games-grid");
  container.innerHTML = "";

  const games = initializeGame();

  userProgress.modules.forEach((module, index) => {
    const card = document.createElement("div");
    card.classList.add("game-card");

    if (module.isCompleted()) {
      card.innerHTML = getCompletedGameHTML(games[index]);
    } else {
      card.innerHTML = getLockedGameHTML(games[index]);
    }

    container.appendChild(card);
  });
}

function renderRedactor(userProgress) {
  const container = document.querySelector(".sandbox-grid");
  container.innerHTML = "";

  const redactors = initializeRedactor();

  userProgress.modules.forEach((module, index) => {
    const card = document.createElement("div");
    card.classList.add("sandbox-card");

    if (module.isCompleted()) {
      card.classList.add("available");
      card.innerHTML = getCompletedRedactorHTML(redactors[index]);
    } else {
      card.classList.add("unavailable");
      card.innerHTML = getLockedRedactorHTML(redactors[index]);
    }

    container.appendChild(card);
  });
}

function getCompletedRedactorHTML(redactor) {
  return `
    <div class="sandbox-image" style="--bg: ${redactor.color}">
          <img
            src="${redactor.img}"
            alt="${redactor.name}"
          />
        </div>
        <div class="game-content">
          <h3>${redactor.name}</h3>
          <p>${redactor.description}</p>
          <span class="status available" onclick="window.location.href='${redactor.url}'">Увійти</span>
        </div>
  `;
}

function getLockedRedactorHTML(game) {
  return `
    <div class="sandbox-image" style="--bg: ${game.color}">
          <img
            src="${game.img}"
            alt="${game.name}"
          />
        </div>
        <div class="game-content">
          <h3>${game.name}</h3>
          <p>${game.description}</p>
          <span disabled class=" status unavailable" onclick="window.location.href='${game.url}'">Блок</span>
        </div>
  `;
}

function getCompletedGameHTML(game) {
  return `
    <div class="game-image" style="--bg: ${game.color}">
          <img
            src="${game.img}"
            alt="${game.name}"
          />
        </div>
        <div class="game-content">
          <h3>${game.name}</h3>
          <p>${game.description}</p>
          <button class="status available" onclick="window.location.href='${game.url}'">Грати</button>
        </div>
  `;
}

function getLockedGameHTML(game) {
  return `
    <div class="game-image" style="--bg: ${game.color}">
          <img
            src="${game.img}"
            alt="${game.name}"
          />
        </div>
        <div class="game-content">
          <h3>${game.name}</h3>
          <p>${game.description}</p>
          <button disabled class=" status unavailable" onclick="window.location.href='${game.url}'">Блок</button>
        </div>
  `;
}

function renderModules(userProgress) {
  const container = document.querySelector(".modules");
  container.innerHTML = "";

  userProgress.modules.forEach((module, index) => {
    const card = document.createElement("div");
    card.classList.add("module-card");

    if (module.isCompleted()) {
      card.classList.add("completed");
      card.innerHTML = getCompletedModuleHTML(module);
    } else if (module.started) {
      card.classList.add("in-progress");
      card.innerHTML = getInProgressModuleHTML(module);
    } else {
      card.classList.add("locked");
      card.innerHTML = getLockedModuleHTML(module);
    }

    container.appendChild(card);
  });
}

function getInProgressModuleHTML(module) {
  // let url = module.url.replace(/^\/?public\//, "");
  let url = module.url;
  return `
    <div class="module-header">
      <h2 class="number-module">${module.name}</h2>
      <span class="icon"
            ><img
              src="https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Fprogress.png?alt=media&token=64df3a77-e1eb-46ef-b4ce-1d2f0198b0a9"
              alt="progress"
          /></span>
    </div>
    <p class="module-description">${module.description || ""}</p>
    <div class="progress-bar orange">
      <div class="fill" style="width: ${getProgressPercent(module)}%"></div>
    </div>
    <p class="progress-text">Прогрес: <strong>${getProgressPercent(
      module
    )}%</strong></p>
    <button class="btn yellow" onclick="saveUserProgressAndRedirect('${url}')">Проходити</button>
  `;
}

function getLockedModuleHTML(module) {
  // let url = module.url.replace(/^\/?public\//, "");
  let url = module.url;

  return `
    <div class="module-header">
      <h2 class="number-module">${module.name}</h2>
      <span class="icon"
            ><img
              src="https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Flock-01.png?alt=media&token=a5424620-412b-43a6-ac66-778b25eca79c"
              alt="lock"
          /></span>
    </div>
    <p class="module-description">Відкриється цей модуль після проходження попереднього</p>
    <div class="progress-bar gray">
      <div class="fill" style="width: 0%"></div>
    </div>
    <p class="progress-text">Заблоковано</p>
    <button class="btn gray" onclick="saveUserProgressAndRedirect('${url}')">Продовжити</button>
  `;
}

function getCompletedModuleHTML(module) {
  // let url = module.url.replace(/^\/?public\//, "");
  let url = module.url;

  return `
    <div class="module-header">
      <h2 class="number-module">${module.name}</h2>
      <span class="icon">
        <img src="https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/images%2Fcheck-broken.png?alt=media&token=895c675d-1e2d-4e89-9274-e6e442db2dbc" alt="check-broken" />
      </span>
    </div>
    <p class="module-description">${module.description || ""}</p>
    <div class="progress-bar green">
      <div class="fill" style="width: 100%"></div>
    </div>
    <p class="progress-text">Пройдено <strong>100%</strong></p>
    <button class="btn blue" onclick="saveUserProgressAndRedirect('${url}')">Продовжити</button>
  `;
}

function getProgressPercent(module) {
  if (module.theoryCompleted && module.test?.passed) return 100;
  if (module.theoryCompleted && module.test?.startedAt) return 60;
  if (module.theoryCompleted) return 40;
  if (module.test?.startedAt) return 20;
  return 0;
}

document.addEventListener("DOMContentLoaded", async function () {
  const toggles = document.querySelectorAll(".sidebar .toggle");
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      const next = this.nextElementSibling;
      if (next && next.classList.contains("sub-menu")) {
        next.classList.toggle("active");
        this.classList.toggle("open");
      }
    });
  });

  const path = window.location.pathname;

  const localUser = RegisterUser.fromLocalStorage();
  if (localUser) {
    setTimeout(() => {
      const hasUnreadNotifications = localUser.notifications.notifications.some(
        (notif) => notif.read === false
      );

      if (hasUnreadNotifications) {
        console.log("Unread notifications found, showing indicator.");

        const indicator = document.querySelector(".unread-indicator");
        console.log("Indicator element:", indicator);
        if (indicator) {
          indicator.style.display = "block";
        }
      }
    }, 500);
  }

  if (path.includes("main.html")) {
    if (localUser) {
      try {
        const fullUser = await RegisterUser.fetchFromDatabaseByEmail(
          localUser.email
        );
        fullUser.lastLogin = new Date().toISOString();
        fullUser.saveToLocalStorage();

        const q = query(
          collection(db, "users"),
          where("email", "==", fullUser.email)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const uid = userDoc.id;
          await RegisterUser.ensureInitialized(uid);
        }

        generateNotificationsForUser(fullUser);
        fullUser.incrementVisits();

        userProgress = await loadProgressFromFirestore(fullUser.uid);
        renderModules(userProgress);
        renderGames(userProgress);
        renderRedactor(userProgress);

        const nameSpan = document.querySelector(".user-name");
        if (nameSpan) {
          nameSpan.textContent = `${localUser.name} ${localUser.surname}`;
        }
      } catch (error) {
        console.error("Failed to fetch user from Firestore:", error);
      }
    }
  } else if (path.includes("quiz-question.html")) {
    await handleQuizPageLoad();
  }

  setTimeout(() => {
    const localUser = RegisterUser.fromLocalStorage();
    if (localUser) {
      const nameSpan = document.querySelector(".user-name");
      if (nameSpan) {
        nameSpan.textContent = `${localUser.name} ${localUser.surname}`;
      }
    }
  }, 500);
});

window.redirectToMainPage = function () {
  window.location.href = "main.html";
};

window.redirectToQuiz = async function (moduleID) {
  const currentUser = RegisterUser.fromLocalStorage();
  console.log(moduleID);
  if (!currentUser) {
    console.error(
      "currentUser not found in localStorage. User might not be logged in or data is corrupted."
    );
    alert(
      "Помилка: дані користувача не знайдено. Будь ласка, спробуйте увійти знову або оновити сторінку."
    );
    return;
  }

  if (
    !currentUser.progress ||
    !(currentUser.progress instanceof UserProgress)
  ) {
    console.error(
      "currentUser.progress is missing or not a UserProgress instance:",
      currentUser.progress
    );
    alert(
      "Дані прогресу користувача пошкоджені або не завантажені. Будь ласка, поверніться на головну сторінку (main.html), щоб дані оновились, та спробуйте знову."
    );
    return;
  }

  const userProgressModule = currentUser.progress.getModuleById(moduleID);

  if (userProgressModule) {
    console.log("Module found in currentUser.progress:", userProgressModule);
    try {
      let quizMode = "take";

      if (!(userProgressModule.test instanceof Test)) {
        console.warn(
          `Module ${moduleID} test was not a Test instance or was null. Re-initializing.`
        );
        userProgressModule.test = new Test();
      }

      if (
        userProgressModule.test.startedAt &&
        userProgressModule.test.finishedAt
      ) {
        console.log(
          `Тест для модуля ${moduleID} вже пройдено. Перехід у режим перегляду.`
        );
        quizMode = "review";
      } else {
        console.log(
          `Тест для модуля ${moduleID} ще не пройдено або не завершено. Перехід у режим проходження.`
        );
        userProgressModule.theoryCompleted = true;

        if (!userProgressModule.test.startedAt) {
          userProgressModule.test.start();
          console.log(`Тест для модуля ${moduleID} розпочато.`);
        }
      }

      localStorage.setItem(
        "currentQuizModule",
        JSON.stringify(userProgressModule.toJSON())
      );
      localStorage.setItem("currentQuizMode", quizMode);

      currentUser.saveToLocalStorage();

      await currentUser.updateFieldsInFirestore({
        progress: currentUser.progress.toJSON(),
      });

      console.log(
        `✅ Модуль підготовлено (режим: ${quizMode}), перенаправлення на quiz-question.html...`
      );
      window.location.href = "quiz-question.html";
    } catch (error) {
      console.error(
        "❌ Сталася помилка під час оновлення модуля та перенаправлення:",
        error
      );
      alert(
        "Сталася помилка при переході до тесту. Спробуйте ще раз. Деталі: " +
          error.message
      );
    }
  } else {
    console.error(
      `Module with ID '${moduleID}' not found in currentUser.progress.`
    );
    alert(
      `Модуль з ID '${moduleID}' не знайдено у вашому прогресі. Неможливо перейти до тесту.`
    );
  }
};

function cleanRedirectUrl(redirectUrl) {
  // Видаляємо `.html` з кінця
  if (redirectUrl.endsWith(".html")) {
    redirectUrl = redirectUrl.slice(0, -5);
  }

  // Видаляємо `/public/`, якщо воно є на початку
  if (redirectUrl.startsWith("/public/")) {
    redirectUrl = redirectUrl.replace("/public/", "");
  }

  return redirectUrl;
}

window.saveUserProgressAndRedirect = function (redirectUrl) {
  if (typeof userProgress !== "undefined" && userProgress !== null) {
    try {
      localStorage.setItem("userProgress", JSON.stringify(userProgress));
      console.log(
        "userProgress збережено в localStorage перед переходом на:",
        redirectUrl
      );
    } catch (error) {
      console.error("Помилка збереження userProgress в localStorage:", error);
    }
  } else {
    console.warn(
      "Змінна userProgress не визначена. Немає чого зберігати в localStorage."
    );
  }
  const currentUser = RegisterUser.fromLocalStorage();
  console.log(cleanRedirectUrl(redirectUrl));
  const userProgressModule = currentUser.progress.getModuleById(
    cleanRedirectUrl(redirectUrl)
  );

  localStorage.setItem(
    "currentQuizModule",
    JSON.stringify(userProgressModule.toJSON())
  );

  window.location.href = redirectUrl;
};

window.markTheoryCompleted = async function (moduleId) {
  window.localUser = RegisterUser.fromLocalStorage();
  const currentModuleStr = localStorage.getItem("currentQuizModule");
  if (!currentModuleStr) {
    console.warn("⚠️ currentQuizModule не знайдено в localStorage.");
    return;
  }

  let parsedModuleData;
  try {
    parsedModuleData = JSON.parse(currentModuleStr);
  } catch (e) {
    console.error(
      "❌ Помилка при парсингу currentQuizModule (JSON-рядка модуля):",
      e,
      "Рядок:",
      currentModuleStr
    );
    return;
  }

  try {
    window.currentModule = Module.fromData(parsedModuleData);
  } catch (e) {
    console.error("❌ Помилка при парсингу currentQuizModule:", e);
    return;
  }
  let progressModule = window.localUser.progress.getModuleById(
    window.currentModule.id
  );
  if (!progressModule) {
    alert(`Модуль '${moduleId}' не знайдено у прогресі.`);
    return;
  }

  try {
    progressModule.theoryCompleted = true;

    window.localUser.notifications.addNotification({
      message: `Теорію успішно завершено! ${progressModule.name}`,
      type: "success",
    });

    console.log(window.localUser);

    window.localUser.saveToLocalStorage();
    await window.localUser.updateFieldsInFirestore({
      [`progress`]: window.localUser.progress.toJSON(),
      [`notifications`]: window.localUser.notifications.toJSON(),
    });

    window.location.href = "main.html";
  } catch (err) {
    console.error("❌ Помилка під час оновлення теорії:", err);
    alert("Сталася помилка при збереженні. Спробуйте ще раз.");
  }
};

window.localUser;

window.quizMode = "take";
window.correctAnswers = 0;

async function handleQuizPageLoad() {
  console.log("📘 Quiz page detected. Running quiz-question logic...");

  const storedMode = localStorage.getItem("currentQuizMode");
  if (storedMode === "review") {
    window.quizMode = "review";
    console.log("📝 Режим перегляду квізу активовано.");
  } else {
    window.quizMode = "take";
    console.log("▶️ Режим проходження квізу активовано.");
  }

  window.localUser = RegisterUser.fromLocalStorage();
  if (!localUser) {
    console.warn(
      "❗ Користувача не знайдено в localStorage на сторінці quiz-question."
    );
    return;
  }
  console.log("👤 currentUser from localStorage:", localUser);

  const currentModuleStr = localStorage.getItem("currentQuizModule");
  if (!currentModuleStr) {
    console.warn("⚠️ currentQuizModule не знайдено в localStorage.");
    return;
  }

  let parsedModuleData;
  try {
    parsedModuleData = JSON.parse(currentModuleStr);
  } catch (e) {
    console.error(
      "❌ Помилка при парсингу currentQuizModule (JSON-рядка модуля):",
      e,
      "Рядок:",
      currentModuleStr
    );
    return;
  }

  try {
    window.currentModule = Module.fromData(parsedModuleData);
    console.log(
      "📦 currentQuizModule parsed from localStorage:",
      window.currentModule
    );
    if (!(window.currentModule.test instanceof Test)) {
      console.error(
        "FATAL: currentModule.test is not an instance of Test after parsing from localStorage!"
      );
      window.currentModule.test = new Test(window.currentModule.test || {});
    }
  } catch (e) {
    console.error(
      "❌ Помилка при парсингу currentQuizModule або створенні екземпляра Module:",
      e
    );
    return;
  }

  window.questions = await loadQuestionsForModule(currentModule.id);
  window.questions.length = 3;
  if (window.questions.length === 0) {
    alert("У цього модуля поки що немає питань.");
    return;
  }

  if (
    window.quizMode === "review" &&
    window.currentModule &&
    window.currentModule.test &&
    window.currentModule.test.answers
  ) {
    console.log(
      "📚 Застосування збережених відповідей для режиму перегляду..."
    );
    const userAnswersMap = window.currentModule.test.answers;

    window.questions.forEach((q) => {
      const savedAnswerData = userAnswersMap[q.id];
      if (savedAnswerData) {
        q.userAnswer = savedAnswerData.userAnswer;
      }
      q.locked = true;
    });
    console.log(
      "📚 Відповіді користувача відновлено, питання заблоковані для режиму перегляду."
    );
  } else if (window.quizMode === "take") {
    if (
      window.currentModule &&
      window.currentModule.test &&
      window.currentModule.test.answers
    ) {
      const userAnswersMap = window.currentModule.test.answers;
      window.questions.forEach((q) => {
        const savedAnswerData = userAnswersMap[q.id];
        if (savedAnswerData && savedAnswerData.userAnswer !== undefined) {
          q.userAnswer = savedAnswerData.userAnswer;
        }
      });
    }
  }

  console.log("✅ Питання завантажено:", window.questions);
  window.correctAnswers = 0;
  showQuestion(0);
}

async function loadQuestionsForModule(moduleId) {
  try {
    const q = query(
      collection(db, "questions"),
      where("moduleId", "==", moduleId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn(`⚠️ Немає питань для модуля: ${moduleId}`);
      return [];
    }

    const questions = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      questions.push(new Question({ id: doc.id, ...data }));
    });

    return questions;
  } catch (error) {
    console.error("❌ Помилка при завантаженні питань:", error);
    return [];
  }
}

function renderQuestion(question, currentIndex, total) {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = `Перевірка знань: ${window.currentModule.description}`;

  const counter = document.createElement("p");
  counter.className = "question-count";
  counter.textContent = `Питання ${currentIndex + 1} з ${total}`;

  const card = document.createElement("div");
  card.className = "question-card";

  const header = document.createElement("div");
  header.className = "question-header";
  const h2 = document.createElement("h2");
  h2.textContent = question.text;
  header.appendChild(h2);

  const answersDiv = document.createElement("div");
  answersDiv.className = "answers";

  const isEffectivelyLocked = question.locked || window.quizMode === "review";

  if (question.type === "single" || question.type === "multiple") {
    question.options.forEach((optionText, i) => {
      const answerDiv = document.createElement("div");
      answerDiv.className = `answer type-${question.type}`;
      const icon = document.createElement("span");
      icon.className = "icon";
      const text = document.createElement("span");
      text.className = "option-text";
      text.textContent = optionText;
      answerDiv.appendChild(icon);
      answerDiv.appendChild(text);

      if (question.type === "single" && question.userAnswer === optionText) {
        answerDiv.classList.add("selected");
      } else if (
        question.type === "multiple" &&
        Array.isArray(question.userAnswer) &&
        question.userAnswer.includes(optionText)
      ) {
        answerDiv.classList.add("selected");
      }

      if (!isEffectivelyLocked) {
        answerDiv.addEventListener("click", () => {
          handleAnswerClick(answerDiv, question, optionText, currentIndex);
        });
      } else {
        answerDiv.style.pointerEvents = "none";
      }
      answersDiv.appendChild(answerDiv);
    });
  } else if (question.type === "open") {
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "answer-open-wrapper";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "open-answer-input";
    input.placeholder = "Введіть вашу відповідь (одне слово)";
    input.value = question.userAnswer || "";

    if (isEffectivelyLocked) {
      input.disabled = true;
    } else {
      input.addEventListener("input", (e) => {
        window.questions[currentIndex].userAnswer = e.target.value;
      });
    }
    inputWrapper.appendChild(input);
    answersDiv.appendChild(inputWrapper);
  }

  card.appendChild(header);
  card.appendChild(answersDiv);

  const buttons = document.createElement("div");
  buttons.className = "buttons";

  const prevBtn = document.createElement("button");
  prevBtn.className = "prev";
  prevBtn.textContent = "Попереднє питання";
  prevBtn.onclick = () => showPrevQuestion();
  prevBtn.disabled = currentIndex === 0;

  const nextBtn = document.createElement("button");
  nextBtn.className = "next";
  if (window.quizMode === "review") {
    nextBtn.textContent =
      currentIndex === total - 1 ? "До результатів" : "Наступне питання";
  } else {
    nextBtn.textContent =
      currentIndex === total - 1 ? "Завершити тест" : "Наступне питання";
  }

  nextBtn.onclick = () => {
    if (window.quizMode === "take" && !isEffectivelyLocked) {
      const currentQuestion = window.questions[currentIndex];
      if (!isAnswerGiven(currentQuestion)) {
        alert("Будь ласка, оберіть або введіть відповідь перед переходом.");
        return;
      }
    }
    showNextQuestion();
  };

  buttons.appendChild(prevBtn);
  buttons.appendChild(nextBtn);

  container.appendChild(title);
  container.appendChild(counter);
  container.appendChild(card);
  container.appendChild(buttons);

  if (isEffectivelyLocked) {
    if (
      window.quizMode === "review" &&
      (!question.feedback || Object.keys(question.feedback).length === 0)
    ) {
      question.feedback = calculateReviewFeedback(question);
    }
    displayFeedback(question, currentIndex);
  }
}

let currentQuestionIndex = 0;
window.questions = [];

function showQuestion(index) {
  if (index >= 0 && index < window.questions.length) {
    currentQuestionIndex = index;
    renderQuestion(window.questions[index], index, window.questions.length);
  }
}

async function showNextQuestion() {
  const currentQ = window.questions[currentQuestionIndex];
  const isEffectivelyLocked = currentQ.locked || window.quizMode === "review";

  if (window.quizMode === "take" && !currentQ.locked) {
    await validateAndLockQuestion(currentQ, currentQuestionIndex);
  } else if (window.quizMode === "review" && !currentQ.locked) {
    console.warn(
      `Питання ${currentQuestionIndex} не було заблоковане в режимі перегляду. Показуємо фідбек.`
    );
    if (!currentQ.feedback || Object.keys(currentQ.feedback).length === 0) {
      currentQ.feedback = calculateReviewFeedback(currentQ);
    }
    displayFeedback(currentQ, currentQuestionIndex);
    currentQ.locked = true;
  }

  if (currentQuestionIndex + 1 < window.questions.length) {
    const delay = window.quizMode === "take" && !isEffectivelyLocked ? 1000 : 0;
    setTimeout(() => {
      showQuestion(currentQuestionIndex + 1);
    }, delay);
  } else {
    const delay = window.quizMode === "take" && !isEffectivelyLocked ? 1000 : 0;
    setTimeout(() => {
      displayFinalResults();
    }, delay);
  }
}

function showPrevQuestion() {
  if (currentQuestionIndex - 1 >= 0) {
    showQuestion(currentQuestionIndex - 1);
  }
}

function handleAnswerClick(answerDiv, question, selectedOption, questionIndex) {
  if (question.locked) {
    return;
  }

  if (question.type === "single") {
    const allAnswerDivs = answerDiv.parentElement.querySelectorAll(".answer");
    allAnswerDivs.forEach((div) => div.classList.remove("selected"));
    answerDiv.classList.add("selected");
    window.questions[questionIndex].userAnswer = selectedOption;
  } else if (question.type === "multiple") {
    let currentLocalUserAnswer = window.questions[questionIndex].userAnswer;

    if (!Array.isArray(window.questions[questionIndex].userAnswer)) {
      window.questions[questionIndex].userAnswer = [];
    }
    const currentAnswers = window.questions[questionIndex].userAnswer;
    answerDiv.classList.toggle("selected");

    if (answerDiv.classList.contains("selected")) {
      if (!currentAnswers.includes(selectedOption)) {
        currentAnswers.push(selectedOption);
      }
    } else {
      const indexToRemove = currentAnswers.indexOf(selectedOption);
      if (indexToRemove > -1) {
        currentAnswers.splice(indexToRemove, 1);
      }
    }
  }
}

async function validateAndLockQuestion(question, questionIndex) {
  if (window.quizMode === "review") {
    console.log(
      "Режим перегляду: validateAndLockQuestion не виконується для збереження."
    );
    if (!question.feedback || Object.keys(question.feedback).length === 0) {
      question.feedback = calculateReviewFeedback(question);
    }
    displayFeedback(question, questionIndex);
    question.locked = true;
    return;
  }

  if (question.locked) {
    console.log(
      `Питання ${questionIndex} вже заблоковане. Пропуск validateAndLockQuestion.`
    );
    displayFeedback(question, questionIndex);
    return;
  }

  question.locked = true;
  question.feedback = {};

  let isQuestionCorrectOverall;
  let pointsEarned = 0;
  let userAnswerToStore = question.userAnswer;

  if (question.type === "single") {
    let definedCorrectAnswer = null;
    if (
      Array.isArray(question.correctAnswer) &&
      question.correctAnswer.length > 0
    ) {
      definedCorrectAnswer = question.correctAnswer[0];
    } else if (typeof question.correctAnswer === "string") {
      definedCorrectAnswer = question.correctAnswer;
    }
    isQuestionCorrectOverall =
      question.userAnswer !== null &&
      typeof question.userAnswer !== "undefined" &&
      question.userAnswer === definedCorrectAnswer;
    if (isQuestionCorrectOverall) pointsEarned = question.points || 0;
    if (
      question.userAnswer !== null &&
      typeof question.userAnswer !== "undefined"
    ) {
      question.feedback[question.userAnswer] = {
        isCorrect: isQuestionCorrectOverall,
        wasSelected: true,
      };
    }
    if (!isQuestionCorrectOverall && definedCorrectAnswer !== null) {
      question.feedback[definedCorrectAnswer] = {
        isCorrect: true,
        wasSelected: false,
      };
    }
    userAnswerToStore = question.userAnswer;
  } else if (question.type === "multiple") {
    const userAnswers = question.userAnswer || [];
    const correctAnswers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [];
    if (correctAnswers.length === 0) {
      isQuestionCorrectOverall = userAnswers.length === 0;
    } else {
      isQuestionCorrectOverall =
        userAnswers.length === correctAnswers.length &&
        correctAnswers.every((ca) => userAnswers.includes(ca)) &&
        userAnswers.every((ua) => correctAnswers.includes(ua));
    }
    if (isQuestionCorrectOverall) pointsEarned = question.points || 0;
    (question.options || []).forEach((option) => {
      const isThisOptionCorrect = correctAnswers.includes(option);
      const wasThisOptionSelected = userAnswers.includes(option);
      question.feedback[option] = {
        isCorrect: isThisOptionCorrect,
        wasSelected: wasThisOptionSelected,
      };
    });
    userAnswerToStore = userAnswers;
  } else if (question.type === "open") {
    let definedCorrectAnswerText = "";
    if (
      Array.isArray(question.correctAnswer) &&
      question.correctAnswer.length > 0
    ) {
      definedCorrectAnswerText = String(question.correctAnswer[0]);
    } else if (
      question.correctAnswer !== null &&
      typeof question.correctAnswer !== "undefined"
    ) {
      definedCorrectAnswerText = String(question.correctAnswer);
    }
    const userAnswerCleaned = (question.userAnswer || "").trim().toLowerCase();
    const correctAnswerCleaned = definedCorrectAnswerText.trim().toLowerCase();
    isQuestionCorrectOverall =
      userAnswerCleaned !== "" && userAnswerCleaned === correctAnswerCleaned;
    if (isQuestionCorrectOverall) pointsEarned = question.points || 0;
    question.feedback = { isCorrect: isQuestionCorrectOverall };
    userAnswerToStore = question.userAnswer;
  }

  if (isQuestionCorrectOverall) {
    window.correctAnswers++;
  }

  if (typeof isQuestionCorrectOverall === "boolean") {
    const progressModule = window.localUser.progress.getModuleById(
      window.currentModule.id
    );
    if (!progressModule || !(progressModule.test instanceof Test)) {
      console.error(
        "Критична помилка: progressModule або progressModule.test не знайдено/не є Test instance при збереженні відповіді."
      );
      alert("Помилка збереження відповіді. Дані модуля пошкоджені.");
      displayFeedback(question, questionIndex);
      return;
    }

    const answerPayload = {
      questionId: question.id,
      userAnswer: userAnswerToStore,
      pointsEarned: pointsEarned,
      isCorrect: isQuestionCorrectOverall,
    };

    const answerObject = new Answer(answerPayload);
    progressModule.test.addAnswer(answerObject);

    window.localUser.saveToLocalStorage();
    console.log("User progress with new answer saved to localStorage.");

    try {
      await window.localUser.updateFieldsInFirestore({
        progress: window.localUser.progress.toJSON(),
      });
      console.log("Firestore updated successfully with new answer.");
    } catch (error) {
      console.error("Помилка оновлення Firestore з відповіддю:", error);
    }
  } else {
    console.warn(
      "isQuestionCorrectOverall не визначено для питання:",
      question.id
    );
  }

  displayFeedback(question, questionIndex);
}

function displayFeedback(question, questionIndex) {
  const container = document.getElementById("quiz-container");
  const answerElements = container.querySelectorAll(".answers .answer");
  const inputElement = container.querySelector(".open-answer-input");

  if (question.type === "single" || question.type === "multiple") {
    answerElements.forEach((el) => {
      const optionText = el.querySelector(".option-text").textContent;
      const feedbackData = question.feedback[optionText];

      el.style.pointerEvents = "none";
      el.classList.remove("selected", "correct", "wrong");

      if (feedbackData) {
        const icon = el.querySelector(".icon");
        if (feedbackData.wasSelected) {
          el.classList.add(feedbackData.isCorrect ? "correct" : "wrong");
          icon.textContent = feedbackData.isCorrect ? "✔" : "✖";
        } else if (feedbackData.isCorrect && question.type === "multiple") {
          el.classList.add("correct-show");
          icon.textContent = "✓";
        } else {
          icon.textContent = "";
        }
      }
    });
  } else if (question.type === "open" && inputElement) {
    inputElement.disabled = true;
    if (question.feedback.isCorrect) {
      inputElement.classList.add("correct");
    } else {
      inputElement.classList.add("wrong");
      const correctAnswerDisplay = document.createElement("p");
      correctAnswerDisplay.className = "correct-answer-display";
      correctAnswerDisplay.textContent = `Правильна відповідь: ${question.correctAnswer}`;
      inputElement.parentElement.appendChild(correctAnswerDisplay);
    }
  }
}

async function displayFinalResults() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  let progressModule = null;
  if (
    window.localUser &&
    window.localUser.progress &&
    window.localUser.progress.getModuleById &&
    window.currentModule &&
    window.currentModule.id
  ) {
    progressModule = window.localUser.progress.getModuleById(
      window.currentModule.id
    );
  }

  if (!progressModule || !(progressModule.test instanceof Test)) {
    console.error(
      "Progress module або test data не знайдено/не є Test instance. Неможливо відобразити результати."
    );
    alert(
      "Критична помилка: не вдалося знайти дані тесту для поточного модуля."
    );
    container.innerHTML =
      "<p>Помилка завантаження результатів.</p><button onclick='window.location.href=\"main.html\"'>На головну</button>";
    return;
  }

  if (window.quizMode === "take" && !progressModule.test.finishedAt) {
    console.log("Завершення тесту в режимі проходження...");
    progressModule.test.finish(window.questions);
    progressModule.test.passed = true;
    progressModule.RedactorUnlocked = progressModule.test.passed;
    progressModule.miniGameUnlocked = progressModule.test.passed;
    progressModule.completedAt = new Date().toISOString();
    window.localUser.notifications.addNotification({
      message: `Тест успішно завершено! ${progressModule.name}`,
      type: "success",
    });
    window.localUser.notifications.addNotification({
      message: `Відкрито нову гру та редактор для модуля ${progressModule.name}`,
      type: "warning",
    });
    window.localUser.saveToLocalStorage();
    try {
      await window.localUser.updateFieldsInFirestore({
        progress: window.localUser.progress.toJSON(),
        [`notifications`]: window.localUser.notifications.toJSON(),
      });
      console.log("Результати тесту збережено у Firestore.");
    } catch (error) {
      console.error(
        "Помилка оновлення Firestore з фінальними результатами:",
        error
      );
      alert(
        "Помилка збереження фінальних результатів на сервері. Ваші результати можуть бути не збережені онлайн."
      );
    }
  } else if (window.quizMode === "review") {
    console.log("Відображення результатів у режимі перегляду...");
  }

  const title = document.createElement("h1");
  title.textContent = "Результати тесту";
  container.appendChild(title);

  const totalScore = progressModule.test.score || 0;
  const maxScore = progressModule.test.maxScore || 0;
  const correctAnswersCount = progressModule.test.getCorrectAnswersCount();
  const totalQuestionsInTest = window.questions.length;
  const durationMs = progressModule.test.getDurationMs();
  const formattedDuration = formatDuration(durationMs);

  const statsBlock = document.createElement("div");
  statsBlock.className = "final-stats";
  statsBlock.innerHTML = `
    <h2>Загальна статистика</h2>
    <p><strong>Правильних відповідей:</strong> ${correctAnswersCount} з ${totalQuestionsInTest}</p>
    <p><strong>Набрано балів:</strong> ${totalScore} / ${maxScore}</p>
    <p><strong>Час проходження:</strong> ${formattedDuration}</p>
  `;
  container.appendChild(statsBlock);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "final-actions";

  const backToMainButton = document.createElement("button");
  backToMainButton.textContent = "Повернутися на головну";
  backToMainButton.className = "back-to-main-button";
  backToMainButton.onclick = () => goToNextModule(progressModule);

  actionsDiv.appendChild(backToMainButton);

  container.appendChild(actionsDiv);
}

function isAnswerGiven(question) {
  if (question.type === "single") {
    return question.userAnswer !== null && question.userAnswer !== undefined;
  }
  if (question.type === "multiple") {
    return Array.isArray(question.userAnswer) && question.userAnswer.length > 0;
  }
  if (question.type === "open") {
    return (question.userAnswer || "").trim().length > 0;
  }
  return false;
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

async function goToNextModule(progressModule) {
  console.log(progressModule);
  tryStartNextModule(window.localUser.progress.modules, progressModule.id);
  await window.localUser.updateFieldsInFirestore({
    progress: window.localUser.progress.toJSON(),
  });
  window.location.href = "main.html";
}

function calculateReviewFeedback(question) {
  const feedback = {};
  if (!question) return feedback;

  if (question.type === "single") {
    const definedCorrectAnswer =
      Array.isArray(question.correctAnswer) && question.correctAnswer.length > 0
        ? question.correctAnswer[0]
        : typeof question.correctAnswer === "string"
        ? question.correctAnswer
        : null;

    const isCorrectUserChoice =
      question.userAnswer !== null &&
      typeof question.userAnswer !== "undefined" &&
      question.userAnswer === definedCorrectAnswer;

    if (
      question.userAnswer !== null &&
      typeof question.userAnswer !== "undefined"
    ) {
      feedback[question.userAnswer] = {
        isCorrect: isCorrectUserChoice,
        wasSelected: true,
      };
    }
    if (
      (!isCorrectUserChoice ||
        question.userAnswer === null ||
        typeof question.userAnswer === "undefined") &&
      definedCorrectAnswer !== null
    ) {
      if (
        !feedback[definedCorrectAnswer] ||
        !feedback[definedCorrectAnswer].wasSelected
      ) {
        feedback[definedCorrectAnswer] = {
          ...feedback[definedCorrectAnswer],
          isCorrect: true,
          wasSelected: false,
        };
      }
    }
  } else if (question.type === "multiple") {
    const userAnswers = question.userAnswer || [];
    const correctAnswers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [];

    (question.options || []).forEach((option) => {
      const isThisOptionCorrect = correctAnswers.includes(option);
      const wasThisOptionSelected = userAnswers.includes(option);
      feedback[option] = {
        isCorrect: isThisOptionCorrect,
        wasSelected: wasThisOptionSelected,
      };
    });
  } else if (question.type === "open") {
    let definedCorrectAnswerText = "";
    if (
      Array.isArray(question.correctAnswer) &&
      question.correctAnswer.length > 0
    ) {
      definedCorrectAnswerText = String(question.correctAnswer[0]);
    } else if (
      question.correctAnswer !== null &&
      typeof question.correctAnswer !== "undefined"
    ) {
      definedCorrectAnswerText = String(question.correctAnswer);
    }

    const userAnswerCleaned = (question.userAnswer || "").trim().toLowerCase();
    const correctAnswerCleaned = definedCorrectAnswerText.trim().toLowerCase();
    feedback.isCorrect =
      userAnswerCleaned !== "" && userAnswerCleaned === correctAnswerCleaned;
    if (!feedback.isCorrect && correctAnswerCleaned) {
      feedback.correctAnswerText = definedCorrectAnswerText;
    }
  }
  return feedback;
}

// function generateNotificationsForUser(user) {
//   const schedule = tempoSchedule[user.temp || "normal"];
//   const registeredDate = new Date(user.registeredAt);
//   const now = new Date();
//   const notificationsToAdd = [];

//   schedule.forEach((dayOffset) => {
//     const targetDate = new Date(registeredDate);
//     targetDate.setDate(targetDate.getDate() + dayOffset);

//     // Якщо цільова дата вже настала і сповіщення ще не існує
//     const isDue = targetDate <= now;
//     const alreadyExists = user.notifications.notifications.some((notif) =>
//       notif.message.includes(`День ${dayOffset}`)
//     );

//     if (isDue && !alreadyExists) {
//       notificationsToAdd.push({
//         message: `Пройшло ${dayOffset} днів з моменту реєстрації — перевір свої результати.`,
//         type: "info",
//         timestamp: targetDate.toISOString(),
//         read: false,
//       });
//     }
//   });

//   if (notificationsToAdd.length > 0) {
//     notificationsToAdd.forEach((notifData) => {
//       user.notifications.addNotification(notifData);
//     });
//     user.saveToLocalStorage();
//     user.updateFieldsInFirestore({
//       notifications: user.notifications.toJSON(),
//     });
//   }
// }

function generateNotificationsForUser(user) {
  const schedule = tempoSchedule[user.temp || "normal"];
  const paceLabelMap = {
    slow: "Розмірений темп 🐌",
    normal: "Нормальний темп 🐕",
    fast: "Прискорений темп 🐆",
  };

  if (!user.registeredAt) {
    console.warn("⚠️ Користувач не має поля `registeredAt`.");
    return;
  }

  const registeredDate =
    user.registeredAt instanceof Date
      ? user.registeredAt
      : user.registeredAt.toDate
      ? user.registeredAt.toDate()
      : new Date(user.registeredAt);

  if (isNaN(registeredDate.getTime())) {
    console.error("❌ Некоректна дата реєстрації:", user.registeredAt);
    return;
  }

  const now = new Date();
  const notificationsToAdd = [];

  console.log(
    `⏰ Генерація сповіщень для користувача ${user.name} (${user.temp})`
  );
  console.log(`📅 Зареєстровано: ${registeredDate.toISOString()}`);
  console.log(`🕒 Поточний час: ${now.toISOString()}`);

  schedule.forEach((hourOffset) => {
    const targetDate = new Date(
      registeredDate.getTime() + hourOffset * 60 * 60 * 1000
    );

    const isDue = targetDate <= now;
    const alreadyGenerated = (user.generatedOffsets || []).includes(hourOffset);

    console.log(`🔍 Offset ${hourOffset} год:`);
    console.log(`   🎯 Очікувана дата: ${targetDate.toISOString()}`);
    console.log(`   ✅ Вже настав: ${isDue}`);
    console.log(`   📬 Вже згенеровано: ${alreadyGenerated}`);

    if (isDue && !alreadyGenerated) {
      const paceText = paceLabelMap[user.temp] || "обраний темп";

      notificationsToAdd.push({
        message: `Через ${hourOffset} год після реєстрації (${paceText}) — перевір свої результати.`,
        type: "info",
        timestamp: targetDate.toISOString(),
        read: false,
      });

      user.generatedOffsets.push(hourOffset); // ✅ маркуємо як згенерований
    }
  });

  if (notificationsToAdd.length > 0) {
    console.log(`🆕 Додано ${notificationsToAdd.length} нових сповіщень`);
    notificationsToAdd.forEach((notifData) => {
      user.notifications.addNotification(notifData);
    });
    user.saveToLocalStorage();
    user.updateFieldsInFirestore({
      notifications: user.notifications.toJSON(),
      generatedOffsets: user.generatedOffsets,
    });
  } else {
    console.log("📭 Немає нових сповіщень для додавання.");
  }
}
