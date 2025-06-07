function includeHTML(file, elementId) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      const target = document.getElementById(elementId);
      if (target) {
        target.innerHTML = data;
      } else {
        console.warn(`Element with ID "${elementId}" not found.`);
      }
    })
    .catch((error) => console.error(`Error loading ${file}:`, error));
}

function loadMainContent(path) {
  const wrapper = document.querySelector(".main-wraper");
  if (!wrapper) {
    console.error('Error: Element with class "main-wraper" not found.');
    return; 
  }
  fetch(path)
    .then((res) => {
      if (!res.ok) throw new Error(`File not found: ${path}`);
      return res.text();
    })
    .then((html) => {
      wrapper.innerHTML = html;
    })
    .catch((err) => {
      if (wrapper) {
        wrapper.innerHTML = "<h2>Сторінку не знайдено</h2><p>" + err.message + "</p>";
      } else {
        console.error("Cannot display 'page not found' because .main-wraper is missing.", err);
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  includeHTML("components/header.html", "header-placeholder");
  loadMainContent("head.html");

  document.querySelectorAll(".toggle[data-file]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const file = link.getAttribute("data-file");
      loadMainContent(file);

      document.querySelectorAll(".toggle").forEach((el) =>
        el.classList.remove("active")
      );
      link.classList.add("active");
    });
  });
});
