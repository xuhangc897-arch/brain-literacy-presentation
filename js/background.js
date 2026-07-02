const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updatePointerGlow(event) {
  if (reduceMotion.matches) {
    return;
  }

  const x = `${(event.clientX / window.innerWidth) * 100}%`;
  const y = `${(event.clientY / window.innerHeight) * 100}%`;

  document.documentElement.style.setProperty("--mx", x);
  document.documentElement.style.setProperty("--my", y);
}

window.addEventListener("pointermove", updatePointerGlow, { passive: true });
