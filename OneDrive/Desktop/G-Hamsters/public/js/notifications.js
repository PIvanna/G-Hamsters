import { RegisterUser } from "./mainPage.js";
import { Notification } from "./mainPage.js";
import { NotificationManager } from "./mainPage.js";

const user = RegisterUser.fromLocalStorage();

function formatTime(isoDate) {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const options = { hour: "2-digit", minute: "2-digit" };

  if (diffDays === 0) {
    return `Сьогодні, ${date.toLocaleTimeString("uk-UA", options)}`;
  } else if (diffDays === 1) {
    return `Вчора, ${date.toLocaleTimeString("uk-UA", options)}`;
  } else {
    return `${diffDays} дні тому`;
  }
}

function getTitleByType(type) {
  switch (type) {
    case "success":
      return "✅ Ви пройшли успішно";
    case "warning":
      return "🔔 Нова вправа доступна";
    case "info":
    default:
      return "📅 Нагадування";
  }
}

export function renderNotifications(notificationsArray = []) {
  const container = document.querySelector(".notifications");
  if (!container) return;

  container.innerHTML = "";

  if (notificationsArray.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "no-notifications";
    emptyMsg.textContent = "Наразі немає сповіщень.";
    container.appendChild(emptyMsg);
    return;
  }

  notificationsArray.forEach((notifData) => {
    const notif =
      notifData instanceof Notification
        ? notifData
        : new Notification(notifData);

    const div = document.createElement("div");
    div.className = "notification";
    if (!notif.read && notif.type === "warning") {
      div.classList.add("unread");
    }

    const h3 = document.createElement("h3");
    h3.textContent = getTitleByType(notif.type);

    const p = document.createElement("p");
    p.textContent = notif.message;

    const span = document.createElement("span");
    span.className = "time";
    span.textContent = formatTime(notif.timestamp);

    // Кнопка "Прочитано"
    const markReadBtn = document.createElement("button");
    markReadBtn.className = "notif-btn mark-read";
    markReadBtn.textContent = "Прочитано";
    markReadBtn.onclick = () => {
      if (!notif.read) {
        Notification.markAsRead(user.uid, notif.id);
        notif.read = true;
        div.classList.remove("unread");
        markReadBtn.disabled = true;
        user.saveToLocalStorage();
      }
    };

    // Кнопка "Видалити"
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "notif-btn delete";
    deleteBtn.textContent = "Видалити";
    deleteBtn.onclick = () => {
      Notification.removeNotificationFromUser(user.uid, notif);
      div.remove();
      user.saveToLocalStorage();
    };

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "notif-actions";
    actionsDiv.appendChild(markReadBtn);
    actionsDiv.appendChild(deleteBtn);

    div.appendChild(h3);
    div.appendChild(p);
    div.appendChild(span);
    div.appendChild(actionsDiv);

    container.appendChild(div);
  });
}

if (user) {
  renderNotifications(user.notifications.notifications);
}

