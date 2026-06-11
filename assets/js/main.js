// Remove trailing slash from URL (keeps root "/" intact)
if (window.location.pathname.length > 1 && window.location.pathname.endsWith('/')) {
  history.replaceState(null, '', window.location.pathname.slice(0, -1) + window.location.search + window.location.hash);
}

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
  const navbar = document.querySelector(".navbar");

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

function initializeScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate], [data-animate-stagger], .section-header, .section-heading');
  
  if (!animatedElements.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });
  
  animatedElements.forEach(el => observer.observe(el));
}

async function initializeSite() {
  await Promise.all([
    loadComponent("navbar-container", "/components/navbar.html"),
    loadComponent("footer-container", "/components/footer.html"),
  ]);

  initializeNavbar();
  initializeScrollAnimations();
}

initializeSite();
