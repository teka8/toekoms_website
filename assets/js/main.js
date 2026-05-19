async function loadComponent(id, file) {
  const element = document.getElementById(id);

  if (!element) return;

  const response = await fetch(file);

  const html = await response.text();

  element.innerHTML = html;

  initializeNavbar();
}

function initializeNavbar() {
  const menuToggle = document.getElementById("menuToggle");

  const navLinks = document.getElementById("navLinks");

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

loadComponent("navbar-container", "/components/navbar.html");

loadComponent("footer-container", "/components/footer.html");