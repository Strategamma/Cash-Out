/* Replay only on a meaningful view/state transition, never for each keypad tap. */
window.CashMotion = {
  enter(element, preset = 'content') {
    if (!element) return;
    const names = ['animate-in','fade-in-0','slide-in-from-bottom-2','zoom-in-95','duration-150','duration-200'];
    element.classList.remove(...names);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'off') return;
    void element.offsetWidth;
    element.classList.add('animate-in','fade-in-0',preset === 'dialog' ? 'zoom-in-95' : 'slide-in-from-bottom-2',preset === 'content' ? 'duration-150' : 'duration-200');
  }
};
