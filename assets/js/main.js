// Remove trailing slash from URL (keeps root "/" intact)
if (window.location.pathname.length > 1 && window.location.pathname.endsWith('/')) {
  history.replaceState(null, '', window.location.pathname.slice(0, -1) + window.location.search + window.location.hash);
}

async function loadComponent(id, file) {
  const element = document.getElementById(id);
  if (!element) return;

  try {
    const response = await fetch(file, { cache: "no-cache" });
    const html = await response.text();
    element.innerHTML = html;
  } catch (err) {
    console.error(`Failed to load component: ${file}`, err);
  }
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

  navLinks.addEventListener("click", (e) => {
    const link = e.target && e.target.closest("a");
    if (!link) return;

    const dropdownParent = link.parentElement && link.parentElement.classList.contains('nav-dropdown')
      ? link.parentElement
      : null;

    const isMobile = window.matchMedia('(max-width: 820px)').matches;
    if (dropdownParent) {
      const submenu = dropdownParent.querySelector(':scope > .dropdown-menu');
      if (submenu && (isMobile || link === dropdownParent.querySelector(':scope > a'))) {
        e.preventDefault();
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
        return;
      }
    }

    setOpen(false);
  });

  document.addEventListener("click", (e) => {
    if (!navLinks.classList.contains("active")) return;
    if (!navbar.contains(e.target)) {
      setOpen(false);
    }
  });

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
        if (window.scrollY > 40) {
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
  const animatedElements = document.querySelectorAll('[data-animate], [data-animate-stagger], .section-header, .section-heading, .card, .step-card');
  if (!animatedElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}

function initializeContactSpamProtection() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  // Set timestamp on page render
  const tsField = document.getElementById('formTimestamp');
  const loadTime = Date.now();
  if (tsField) tsField.value = String(loadTime);

  // Generate dynamic randomized math check
  const num1 = Math.floor(Math.random() * 8) + 2;
  const num2 = Math.floor(Math.random() * 7) + 1;
  const expectedAnswer = num1 + num2;

  const mathLabel = document.getElementById('mathChallengeLabel');
  const mathAnswerInput = document.getElementById('mathChallengeAnswer');

  if (mathLabel) {
    mathLabel.textContent = `Security Verification: What is ${num1} + ${num2}?`;
  }

  contactForm.addEventListener('submit', function(e) {
    // 1. Check honeypot
    const honey = contactForm.querySelector('input[name="_honey"]');
    if (honey && honey.value.trim() !== '') {
      e.preventDefault();
      alert('Spam detected. Submission halted.');
      return false;
    }

    // 2. Check submission timing (bot prevention: minimum 2 seconds)
    const submitTime = Date.now();
    if (submitTime - loadTime < 2000) {
      e.preventDefault();
      alert('Form was submitted too quickly. Please take a moment to review before submitting.');
      return false;
    }

    // 3. Check math challenge answer
    if (mathAnswerInput) {
      const userAnswer = parseInt(mathAnswerInput.value.trim(), 10);
      if (isNaN(userAnswer) || userAnswer !== expectedAnswer) {
        e.preventDefault();
        alert('Incorrect security verification answer. Please calculate and enter the correct sum.');
        mathAnswerInput.focus();
        return false;
      }
    }
  });
}

function initializeResumeForm() {
  const fileUploadArea = document.getElementById('fileUploadArea');
  const fileInput = document.getElementById('resumeFile');
  const fileName = document.getElementById('fileName');
  const resumeForm = document.getElementById('resumeForm');

  if (fileInput) {
    fileInput.addEventListener('change', function() {
      if (this.files && this.files.length > 0) {
        const file = this.files[0];
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be under 5MB.');
          this.value = '';
          if (fileName) fileName.textContent = '';
          return;
        }
        if (fileName) fileName.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      }
    });
  }

  if (fileUploadArea && fileInput) {
    fileUploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('drag-over');
    });

    fileUploadArea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
    });

    fileUploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        const file = e.dataTransfer.files[0];
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be under 5MB.');
          fileInput.value = '';
          if (fileName) fileName.textContent = '';
          return;
        }
        if (fileName) fileName.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      }
    });
  }

  if (resumeForm) {
    resumeForm.addEventListener('submit', function(e) {
      const honey = resumeForm.querySelector('input[name="_honey"]');
      if (honey && honey.value.trim() !== '') {
        e.preventDefault();
        alert('Spam detected. Submission halted.');
        return false;
      }
    });
  }
}

function initializeCookieBanner() {
  const consentKey = 'toekoms_cookie_consent';
  let banner = document.getElementById('cookieBanner');

  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.className = 'cookie-consent-banner';
    banner.innerHTML = `
      <div class="cookie-content">
        <p>
          <strong>Data Privacy &amp; Visitor Transparency:</strong> Toekoms Digital uses first-party cookies to measure site performance, ensure security, and enhance your digital experience. We never sell your personal data.
        </p>
      </div>
      <div class="cookie-actions">
        <button type="button" class="cookie-btn cookie-btn-decline" id="cookieDeclineBtn">Decline</button>
        <button type="button" class="cookie-btn cookie-btn-accept" id="cookieAcceptBtn">Accept</button>
      </div>
    `;
    document.body.appendChild(banner);
  }

  const savedConsent = localStorage.getItem(consentKey);
  if (!savedConsent) {
    setTimeout(() => {
      banner.classList.add('is-visible');
    }, 800);
  }

  const acceptBtn = document.getElementById('cookieAcceptBtn');
  const declineBtn = document.getElementById('cookieDeclineBtn');
  const settingsBtn = document.getElementById('cookieSettingsBtn');

  if (acceptBtn) {
    acceptBtn.onclick = () => {
      localStorage.setItem(consentKey, 'accepted');
      banner.classList.remove('is-visible');
    };
  }

  if (declineBtn) {
    declineBtn.onclick = () => {
      localStorage.setItem(consentKey, 'declined');
      banner.classList.remove('is-visible');
    };
  }

  if (settingsBtn) {
    settingsBtn.onclick = (e) => {
      e.preventDefault();
      banner.classList.add('is-visible');
    };
  }
}

async function initializeSite() {
  await Promise.all([
    loadComponent("navbar-container", "/components/navbar.html"),
    loadComponent("footer-container", "/components/footer.html"),
  ]);

  initializeNavbar();
  initializeScrollAnimations();
  initializeContactSpamProtection();
  initializeResumeForm();
  initializeCookieBanner();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSite);
} else {
  initializeSite();
}
