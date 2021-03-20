// This injects a box into the page that moves with the mouse;
// Useful for debugging
const MouseHelper = async (page) => {
  await page.evaluateOnNewDocument(() => {
    // Install mouse helper only for top-level frame.
    if (window !== window.parent)
      return;
    window.addEventListener('DOMContentLoaded', () => {
      const box = document.createElement('puppeteer-mouse-pointer');
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
      puppeteer-mouse-pointer {
        pointer-events: none;
        position: absolute;
        top: ${window.innerHeight/2}px;
        left: ${window.innerWidth/2}px;
        width: 5vw;
        height: 5vw;
        border-radius: 2.5vw;
        margin: -10px 0 0 -10px;
        padding: 0;
        transition: background .2s, border-radius .2s, border-color .2s;
      }
      puppeteer-mouse-pointer.button-1 {
        transition: none;
        background-color: rgba(0,0,0,0.9) !important;
      }
      puppeteer-mouse-pointer.button-2 {
        transition: none;
        border-color: rgba(0,0,255,0.9);
      }
      puppeteer-mouse-pointer.button-3 {
        transition: none;
        border-radius: 0.1vw;
      }
      puppeteer-mouse-pointer.button-4 {
        transition: none;
        border-color: rgba(255,0,0,0.9);
      }
      puppeteer-mouse-pointer.button-5 {
        transition: none;
        border-color: rgba(0,255,0,0.9);
      }
    `;
      document.head.appendChild(styleElement);
      document.body.appendChild(box);
      document.addEventListener('mousedown', event => {
        updateButtons(event.buttons);
        box.classList.add('button-' + event.key);
      }, true);
      document.addEventListener('mouseup', event => {
        updateButtons(event.buttons);
        box.classList.remove('button-' + event.key);
      }, true);
      document.addEventListener('scroll', event => {
        box.style.top = (window.innerHeight/2) + 
          document.scrollingElement.scrollTop + 'px';
        updateButtons(event.buttons);
      }, true);
      const updateButtons = (buttons) => {
        for (let i = 0; i < 5; i++)
          box.classList.toggle('button-' + i, buttons & (1 << i));
      }
    }, false);
  });
};

module.exports = MouseHelper;