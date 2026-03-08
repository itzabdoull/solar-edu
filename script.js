const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("site-nav");
const progressKey = "solarSparkProgress";
const trackedPages = [
  "beginners",
  "technology",
  "system-design",
  "economics",
  "advanced",
  "glossary",
  "resources",
  "calculator",
];

function applyCurrentPageState() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".site-nav a").forEach((link) => {
    const href = link.getAttribute("href");

    if (href === currentPath) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if (navToggle && siteNav) {
  navToggle.setAttribute("aria-label", "Toggle navigation menu");
  const mobileNavQuery = window.matchMedia("(max-width: 960px)");

  function setNavState(isOpen) {
    siteNav.classList.toggle("is-open", isOpen);
    siteNav.setAttribute("aria-hidden", mobileNavQuery.matches ? String(!isOpen) : "false");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  }

  function syncNavForViewport() {
    if (!mobileNavQuery.matches) {
      siteNav.classList.remove("is-open");
      siteNav.setAttribute("aria-hidden", "false");
      navToggle.setAttribute("aria-expanded", "false");
    } else if (!siteNav.classList.contains("is-open")) {
      siteNav.setAttribute("aria-hidden", "true");
      navToggle.setAttribute("aria-expanded", "false");
    }
  }

  navToggle.addEventListener("click", () => {
    const isOpen = !siteNav.classList.contains("is-open");
    setNavState(isOpen);

    if (isOpen) {
      const firstLink = siteNav.querySelector("a");
      firstLink?.focus();
    }
  });

  navToggle.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" && !siteNav.classList.contains("is-open")) {
      event.preventDefault();
      setNavState(true);
      siteNav.querySelector("a")?.focus();
    }
  });

  siteNav.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavState(false);
      navToggle.focus();
    }
  });

  mobileNavQuery.addEventListener("change", syncNavForViewport);
  syncNavForViewport();
}

function getProgressState() {
  try {
    return JSON.parse(localStorage.getItem(progressKey)) || {};
  } catch {
    return {};
  }
}

function saveProgressState(state) {
  localStorage.setItem(progressKey, JSON.stringify(state));
}

function getCompletedProgressSummary() {
  const state = getProgressState();
  const completedCount = trackedPages.filter((page) => state[page]).length;
  return {
    completedCount,
    total: trackedPages.length,
    percent: Math.round((completedCount / trackedPages.length) * 100),
  };
}

function renderProgressPanels() {
  const state = getProgressState();
  const { completedCount, total, percent } = getCompletedProgressSummary();

  document.querySelectorAll(".progress-panel").forEach((panel) => {
    const page = panel.getAttribute("data-track-page");
    const fill = panel.querySelector(".progress-fill");
    const status = panel.querySelector(".progress-status");
    const button = panel.querySelector(".progress-button");
    const isTrackable = trackedPages.includes(page);
    const isComplete = Boolean(state[page]);

    if (fill) {
      fill.style.width = `${percent}%`;
      fill.parentElement?.setAttribute("role", "progressbar");
      fill.parentElement?.setAttribute("aria-valuemin", "0");
      fill.parentElement?.setAttribute("aria-valuemax", String(total));
      fill.parentElement?.setAttribute("aria-valuenow", String(completedCount));
      fill.parentElement?.setAttribute("aria-label", "Course progress");
    }

    if (status) {
      if (isTrackable) {
        status.textContent = `${completedCount}/${total} tracked pages complete${isComplete ? " - this page is marked complete." : "."}`;
      } else {
        status.textContent = `${completedCount}/${total} tracked pages complete.`;
      }
    }

    if (button) {
      button.textContent = isComplete ? "Completed" : "Mark as complete";
      button.disabled = isComplete;
      button.setAttribute("aria-disabled", String(isComplete));
      button.addEventListener("click", () => {
        const nextState = getProgressState();
        nextState[page] = true;
        saveProgressState(nextState);
        renderProgressPanels();
      }, { once: true });
    }
  });
}

function renderCertificate() {
  const nameInput = document.getElementById("certificate-name");
  const recipient = document.getElementById("certificate-recipient");
  const progress = document.getElementById("certificate-progress");
  const date = document.getElementById("certificate-date");
  const certificateId = document.getElementById("certificate-id");
  const status = document.getElementById("certificate-status");
  const printButton = document.getElementById("print-certificate");

  if (!recipient || !progress || !date || !certificateId || !status || !printButton) {
    return;
  }

  const { completedCount, total } = getCompletedProgressSummary();
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function updateCertificateName() {
    const value = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Learner Name";
    recipient.textContent = value;
    certificateId.textContent = `SSA-${today.getFullYear()}-${String(completedCount).padStart(2, "0")}${value.length}`;
  }

  progress.textContent = `${completedCount}/${total} tracked pages completed`;
  date.textContent = formattedDate;
  status.textContent = completedCount === total
    ? "All tracked pages are complete. The certificate is ready to print."
    : `Progress is ${completedCount}/${total}. You can still print, but the certificate will show the saved completion count.`;

  if (nameInput) {
    nameInput.addEventListener("input", updateCertificateName);
  }

  updateCertificateName();

  printButton.addEventListener("click", () => {
    updateCertificateName();
    window.print();
  });
}

const form = document.getElementById("solar-form");

if (form) {
  const usageInput = document.getElementById("usage");
  const rateInput = document.getElementById("rate");
  const offsetInput = document.getElementById("offset");
  const offsetValue = document.getElementById("offset-value");
  const savingsOutput = document.getElementById("savings-output");
  const billOutput = document.getElementById("bill-output");

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function calculateEstimate() {
    const usage = Number(usageInput.value);
    const rate = Number(rateInput.value);
    const offsetPercent = Number(offsetInput.value) / 100;
    const currentBill = usage * rate;
    const savings = currentBill * offsetPercent;
    const newBill = currentBill - savings;

    offsetValue.textContent = `${offsetInput.value}%`;
    offsetInput.setAttribute("aria-valuetext", `${offsetInput.value} percent offset`);
    savingsOutput.textContent = formatCurrency(savings);
    billOutput.textContent = `New estimated monthly bill: ${formatCurrency(newBill)}`;
  }

  offsetInput.addEventListener("input", calculateEstimate);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculateEstimate();
  });

  calculateEstimate();
}

const quizForms = document.querySelectorAll(".quiz-form");

quizForms.forEach((quizForm) => {
  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const questions = quizForm.querySelectorAll("[data-correct]");
    const result = quizForm.querySelector(".quiz-result");
    let score = 0;

    questions.forEach((question) => {
      const correct = question.getAttribute("data-correct");
      const checked = question.querySelector("input[type='radio']:checked");

      question.classList.remove("is-correct", "is-incorrect");

      if (checked && checked.value === correct) {
        score += 1;
        question.classList.add("is-correct");
      } else {
        question.classList.add("is-incorrect");
      }
    });

    if (result) {
      const total = questions.length;
      const title = quizForm.getAttribute("data-quiz-title") || "Quiz";
      result.textContent = `${title}: ${score}/${total} correct`;
    }
  });
});

applyCurrentPageState();
renderProgressPanels();
renderCertificate();
