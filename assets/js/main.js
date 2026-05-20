async function loadComponent(id, file) {
  const element = document.getElementById(id);

  if (!element) return;

  const response = await fetch(file, { cache: "no-cache" });
  const html = await response.text();

  element.innerHTML = html;
}

function initializeNavbar() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

async function initializeSite() {
  await Promise.all([
    loadComponent("navbar-container", "components/navbar.html"),
    loadComponent("footer-container", "components/footer.html"),
  ]);

  initializeNavbar();
}

initializeSite();
