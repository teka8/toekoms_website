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

  const setOpen = (open) => {
    navLinks.classList.toggle("active", open);
    document.body.classList.toggle("nav-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    if (!open) {
      // Collapse any open dropdowns when the menu closes
      navLinks.querySelectorAll('.nav-dropdown.open').forEach(el => {
        el.classList.remove('open');
        const parentLink = el.querySelector(':scope > a');
        if (parentLink) parentLink.setAttribute('aria-expanded', 'false');
      });
    }
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = !navLinks.classList.contains("active");
    setOpen(isOpen);
  });

  // Handle link clicks within the nav
  navLinks.addEventListener("click", (e) => {
    const link = e.target && e.target.closest("a");
    if (!link) return;

    const dropdownParent = link.parentElement && link.parentElement.classList.contains('nav-dropdown')
      ? link.parentElement
      : null;

    // Toggle dropdowns on mobile; also support click-to-open on desktop for parents
    const isMobile = window.matchMedia('(max-width: 820px)').matches;
    if (dropdownParent) {
      const submenu = dropdownParent.querySelector(':scope > .dropdown-menu');
      if (submenu) {
        e.preventDefault();
        // Close open siblings at the same level (accordion-like)
        const siblings = Array.from(dropdownParent.parentElement.children)
          .filter(li => li !== dropdownParent && li.classList.contains('nav-dropdown'));
        siblings.forEach(sib => {
          sib.classList.remove('open');
          const sibLink = sib.querySelector(':scope > a');
          if (sibLink) sibLink.setAttribute('aria-expanded', 'false');
        });

        const willOpen = !dropdownParent.classList.contains('open');
        dropdownParent.classList.toggle('open', willOpen);
        link.setAttribute('aria-expanded', String(willOpen));
        e.stopPropagation();
        // On mobile, do not close the whole nav when toggling
        if (isMobile) return;
        // On desktop, keep the nav open regardless
        return;
      }
    }

    // Regular link: close the nav after navigation intent
    setOpen(false);
  });

  // Keyboard support: toggle dropdowns on Enter/Space in mobile
  navLinks.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const link = e.target && e.target.closest('a');
    if (!link) return;
    const dropdownParent = link.parentElement && link.parentElement.classList.contains('nav-dropdown')
      ? link.parentElement
      : null;
    const isMobile = window.matchMedia('(max-width: 820px)').matches;
    if (isMobile && dropdownParent) {
      e.preventDefault();
      const submenu = dropdownParent.querySelector(':scope > .dropdown-menu');
      if (!submenu) return;
      // Accordion behavior
      const siblings = Array.from(dropdownParent.parentElement.children)
        .filter(li => li !== dropdownParent && li.classList.contains('nav-dropdown'));
      siblings.forEach(sib => {
        sib.classList.remove('open');
        const sibLink = sib.querySelector(':scope > a');
        if (sibLink) sibLink.setAttribute('aria-expanded', 'false');
      });
      const willOpen = !dropdownParent.classList.contains('open');
      dropdownParent.classList.toggle('open', willOpen);
      link.setAttribute('aria-expanded', String(willOpen));
    }
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!navLinks.classList.contains("active")) return;
    const target = e.target;
    if (!navbar.contains(target)) {
      setOpen(false);
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("active")) {
      setOpen(false);
      menuToggle.focus();
    }
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
