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

function initializeScrollReveal() {
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (!revealItems.length) return;

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

async function initializeSite() {
  await Promise.all([
    loadComponent("navbar-container", "components/navbar.html"),
    loadComponent("footer-container", "components/footer.html"),
  ]);

  initializeNavbar();
  initializeScrollReveal();
}

initializeSite();
