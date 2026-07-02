const slides = Array.from(document.querySelectorAll("[data-slide]"));
const currentPage = document.getElementById("currentPage");
const totalPages = document.getElementById("totalPages");
const progressBar = document.getElementById("progressBar");
const notesPanel = document.getElementById("notesPanel");
const noteToggle = document.getElementById("noteToggle");
const memoryChallenge = document.querySelector(".memory-challenge");
const memoryIntro = document.querySelector("[data-memory-intro]");
const memoryPlay = document.querySelector("[data-memory-play]");
const memoryRecall = document.querySelector("[data-memory-recall]");
const memoryTimer = document.querySelector("[data-memory-timer]");
const memoryStart = document.querySelector("[data-start-memory]");

let activeIndex = 0;
let lastWheelTime = 0;
let memoryInterval = null;
const wheelDelay = 720;
const memoryDuration = 30;

function formatPageNumber(number) {
  return String(number).padStart(2, "0");
}

function getStepCount(slide) {
  return Number(slide.dataset.steps || 0);
}

function getCurrentStep(slide) {
  return Number(slide.dataset.currentStep || 0);
}

function setCurrentStep(slide, step) {
  const safeStep = Math.max(0, Math.min(step, getStepCount(slide)));
  slide.dataset.currentStep = String(safeStep);
  slide.classList.toggle("step-1", safeStep >= 1);
}

function setMemoryTimer(seconds) {
  if (!memoryTimer) {
    return;
  }

  memoryTimer.textContent = String(seconds).padStart(2, "0");
  memoryTimer.setAttribute("aria-label", `剩余 ${seconds} 秒`);
}

function stopMemoryTimer() {
  if (memoryInterval) {
    clearInterval(memoryInterval);
    memoryInterval = null;
  }
}

function resetMemoryChallenge() {
  if (!memoryChallenge) {
    return;
  }

  stopMemoryTimer();
  memoryIntro.hidden = false;
  memoryPlay.hidden = true;
  memoryRecall.hidden = true;
  memoryChallenge.dataset.memoryState = "intro";
  setMemoryTimer(memoryDuration);
}

function showMemoryRecall() {
  stopMemoryTimer();
  memoryIntro.hidden = true;
  memoryPlay.hidden = true;
  memoryRecall.hidden = false;
  memoryChallenge.dataset.memoryState = "recall";
}

function startMemoryChallenge() {
  let secondsLeft = memoryDuration;

  stopMemoryTimer();
  memoryIntro.hidden = true;
  memoryPlay.hidden = false;
  memoryRecall.hidden = true;
  memoryChallenge.dataset.memoryState = "play";
  setMemoryTimer(secondsLeft);

  memoryInterval = setInterval(() => {
    secondsLeft -= 1;
    setMemoryTimer(secondsLeft);

    if (secondsLeft <= 0) {
      showMemoryRecall();
    }
  }, 1000);
}

function updateNotes() {
  const note = slides[activeIndex].querySelector(".speaker-notes");
  notesPanel.textContent = note ? note.textContent.trim() : "";
}

function updateDeck() {
  slides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === activeIndex);
  });

  currentPage.textContent = formatPageNumber(activeIndex + 1);
  totalPages.textContent = formatPageNumber(slides.length);
  progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  updateNotes();
}

function goToSlide(index) {
  const nextIndex = Math.max(0, Math.min(index, slides.length - 1));

  if (nextIndex === activeIndex) {
    return;
  }

  if (slides[activeIndex] === memoryChallenge || slides[nextIndex] === memoryChallenge) {
    resetMemoryChallenge();
  }

  activeIndex = nextIndex;
  setCurrentStep(slides[activeIndex], 0);
  updateDeck();
}

function advance() {
  const activeSlide = slides[activeIndex];
  const step = getCurrentStep(activeSlide);
  const stepCount = getStepCount(activeSlide);

  if (step < stepCount) {
    setCurrentStep(activeSlide, step + 1);
    return;
  }

  goToSlide(activeIndex + 1);
}

function previous() {
  const activeSlide = slides[activeIndex];
  const step = getCurrentStep(activeSlide);

  if (step > 0) {
    setCurrentStep(activeSlide, step - 1);
    return;
  }

  goToSlide(activeIndex - 1);
}

function toggleNotes() {
  const isOpen = document.body.classList.toggle("notes-open");
  noteToggle.setAttribute("aria-pressed", String(isOpen));
}

document.addEventListener("keydown", (event) => {
  const isTyping = ["INPUT", "TEXTAREA"].includes(event.target.tagName);

  if (isTyping) {
    return;
  }

  if (event.key === "ArrowRight" || event.key === " " || event.key === "Spacebar") {
    event.preventDefault();
    advance();
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    previous();
  }

  if (event.key.toLowerCase() === "n") {
    event.preventDefault();
    toggleNotes();
  }
});

document.addEventListener("click", (event) => {
  if (event.target.closest("button")) {
    return;
  }

  advance();
});

document.addEventListener(
  "wheel",
  (event) => {
    const now = Date.now();

    if (now - lastWheelTime < wheelDelay) {
      return;
    }

    lastWheelTime = now;

    if (event.deltaY > 0) {
      goToSlide(activeIndex + 1);
    } else if (event.deltaY < 0) {
      goToSlide(activeIndex - 1);
    }
  },
  { passive: true }
);

noteToggle.addEventListener("click", toggleNotes);
memoryStart?.addEventListener("click", startMemoryChallenge);

slides.forEach((slide) => setCurrentStep(slide, 0));
resetMemoryChallenge();
updateDeck();
