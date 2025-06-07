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
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { db, auth } from "./firebase-config.js";

class RegisterUser {
  constructor(data) {
    this.uid = data.uid || null;
    this.name = data.name;
    this.surname = data.surname;
    this.email = data.email;
    this.phone = data.phone;
    this.registeredAt = data.registeredAt;
  }

  static fromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("currentUser"));
    return data ? new RegisterUser(data) : null;
  }

  toJSON() {
    return {
      uid: this.uid,
      name: this.name,
      surname: this.surname,
      email: this.email,
      phone: this.phone,
      registeredAt: this.registeredAt,
    };
  }

  saveToLocalStorage() {
    localStorage.setItem("currentUser", JSON.stringify(this.toJSON()));
  }

  static async fetchFromDatabaseByEmail(email) {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const userData = docSnap.data();
      userData.uid = docSnap.id; // додаємо uid вручну
      return new RegisterUser(userData);
    } else {
      throw new Error("User not found in Firestore");
    }
  }

  static async ensureInitialized(uid) {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      console.warn("Користувач не знайдений у Firestore, хоча мав би бути.");
      return;
    }

    const data = snap.data();
    if (!data.progress) {
      const progress = initializeModulesProgress();
      await updateDoc(userRef, {
        progress: progress.toJSON(),
        lastUpdated: serverTimestamp(),
      });

      console.log("Поле 'progress' додано для користувача.");
    } else {
      console.log("Прогрес уже існує — нічого не змінюємо.");
    }
  }
}

class Test {
  constructor({
    startedAt = null,
    finishedAt = null,
    score = 0,
    maxScore = 0,
    passed = false,
  } = {}) {
    this.startedAt = startedAt;
    this.finishedAt = finishedAt;
    this.score = score;
    this.maxScore = maxScore;
    this.passed = passed;
  }

  start() {
    this.startedAt = new Date().toISOString();
  }

  finish(score, maxScore) {
    this.finishedAt = new Date().toISOString();
    this.score = score;
    this.maxScore = maxScore;
    this.passed = score / maxScore >= 0.7;
  }

  isPassed() {
    return this.passed;
  }

  toJSON() {
    return {
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      score: this.score,
      maxScore: this.maxScore,
      passed: this.passed,
    };
  }
}

class Module {
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
    this.test = test ? new Test(test) : new Test();
    this.miniGameUnlocked = miniGameUnlocked;
    this.RedactorUnlocked = RedactorUnlocked;
    this.completedAt = completedAt;
    this.started = started;
    this.description = description;
    this.url = url;
  }

  isCompleted() {
    return this.theoryCompleted && this.test?.isPassed();
  }

  unlockMiniGame() {
    if (this.isCompleted()) {
      this.miniGameUnlocked = true;
    }
  }

  start() {
    this.started = true;
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
}

class Game {
  constructor({
    id,
    name,
    miniGameUnlocked = false,
    description,
    url,
    img,
    color,
  }) {
    this.id = id;
    this.name = name;
    this.miniGameUnlocked = miniGameUnlocked;
    this.description = description;
    this.url = url;
    this.img = img;
    this.color = color;
  }
}

class UserProgress {
  constructor(modules = []) {
    this.modules = modules.map((m) => new Module(m));
  }

  getModuleById(id) {
    return this.modules.find((m) => m.id === id);
  }

  unlockNextModule(currentModuleId) {
    const index = this.modules.findIndex((m) => m.id === currentModuleId);
    const next = this.modules[index + 1];
    if (next && this.modules[index].isCompleted()) {
    }
  }

  toJSON() {
    return this.modules.map((module) => module.toJSON());
  }

  static fromData(modulesData) {
    return new UserProgress(modulesData);
  }
}
