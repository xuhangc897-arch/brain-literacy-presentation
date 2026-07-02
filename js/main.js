const slides = Array.from(document.querySelectorAll("[data-slide]"));
const currentPage = document.getElementById("currentPage");
const totalPages = document.getElementById("totalPages");
const progressBar = document.getElementById("progressBar");

let activeIndex = 0;
let lastWheelTime = 0;
const wheelDelay = 760;

function formatPageNumber(number) {
  return String(number).padStart(2, "0");
}

function updateDeck() {
  slides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === activeIndex);
  });

  currentPage.textContent = formatPageNumber(activeIndex + 1);
  totalPages.textContent = formatPageNumber(slides.length);
  progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
}

function goToSlide(index) {
  const nextIndex = Math.max(0, Math.min(index, slides.length - 1));

  if (nextIndex === activeIndex) {
    return;
  }

  activeIndex = nextIndex;
  updateDeck();
}

function nextSlide() {
  goToSlide(activeIndex + 1);
}

function previousSlide() {
  goToSlide(activeIndex - 1);
}

document.addEventListener("keydown", (event) => {
  const nextKeys = ["ArrowRight", " ", "Spacebar"];
  const previousKeys = ["ArrowLeft"];

  if (nextKeys.includes(event.key)) {
    event.preventDefault();
    nextSlide();
  }

  if (previousKeys.includes(event.key)) {
    event.preventDefault();
    previousSlide();
  }
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
      nextSlide();
    } else if (event.deltaY < 0) {
      previousSlide();
    }
  },
  { passive: true }
);

updateDeck();
