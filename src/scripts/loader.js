

const LOADER_MIN_MS = 900;
const LOADER_MAX_MS = 2800;

function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    dismissLoader(loader);
    return;
  }

  const startTime = Date.now();
  const safetyTimeout = setTimeout(() => dismissLoader(loader), LOADER_MAX_MS);

  function onLoad() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, LOADER_MIN_MS - elapsed);
    clearTimeout(safetyTimeout);
    setTimeout(() => dismissLoader(loader), remaining);
  }

  if (document.readyState === 'complete') {
    onLoad();
  } else {
    window.addEventListener('load', onLoad, { once: true });
  }
}

function dismissLoader(loader) {
  loader.classList.add('hidden');

  loader.addEventListener('transitionend', () => {
    loader.remove();
    moveFocusToMain();
  }, { once: true });

  setTimeout(() => {
    if (loader.isConnected) {
      loader.remove();
      moveFocusToMain();
    }
  }, 700);
}

function moveFocusToMain() {
  if (moveFocusToMain._called) return;
  moveFocusToMain._called = true;
  const main = document.getElementById('main-content');
  if (!main) return;
  main.setAttribute('tabindex', '-1');
  main.focus({ preventScroll: true });
  main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
}

export { initLoader };
