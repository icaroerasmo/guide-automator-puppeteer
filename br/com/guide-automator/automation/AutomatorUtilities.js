const MouseSimulator = require('./MouseSimulator');

class AutomatorUtilities {

    constructor (page) {
        this.page = page;
        this.mouseSimulator = new MouseSimulator(this.page);
    }

    async screenshotImpl(path) {
        await this.page.screenshot(
            {
                path: path
            });
        return this;
    }

    screenshotOfEntire(path) {
        return this.screenshotImpl(path);
    }

    async screenshotFromSelector() {
        await this.autoScroll();
        await this.page.waitForSelector(arguments[0]);
        await this.page.evaluate(selector => {
            const element = document.querySelector(selector);
            if (!element){
                throw new Error(`Selector '${selector}' not found`);
            }
            element.scrollIntoView();
        }, arguments[0]);
        await this.waitForTransitionEnd(null, arguments[0]);
        await this.moveCursorToSelector(arguments[0]);
        return this.screenshotImpl(arguments[2]);
    }

    async waitForTransitionEnd(timeout, selector) {
        return this.page.evaluate((timeout, selector) => {
            return new Promise((resolve) => {
                let counter = 0;
                const dom = document.querySelector(selector) || document.body;
                const onEnd = () => {
                    counter = counter+1;
                    if(counter > 1){
                        dom.removeEventListener('transitionend', onEnd);
                        resolve(false);
                    }
                };
                if(!timeout || typeof timeout !== 'number'){
                    timeout = 50000;
                }
                setTimeout(() => {
                    dom.removeEventListener('transitionend', onEnd);
                    resolve(true);
                }, timeout);
                dom.addEventListener('transitionend', onEnd);
            });
        }, timeout, selector);
    }

    async moveCursorToSelector(selector) {
        const el = await this.page.$(selector);
        const boundingBox = await el.boundingBox();
        await this.mouseSimulator.
            moveCursorToCoordinates(boundingBox);        
        return this;
    }

    async autoScroll(){
        await this.page.evaluate(async () => {
            const distance = 100;
            const delay = 100;
            while (document.scrollingElement.scrollTop +
                 window.innerHeight <
                 document.scrollingElement.scrollHeight) {
              document.scrollingElement.scrollBy(0, distance);
              await new Promise(resolve => { setTimeout(resolve, delay); });
            }
        });
    }
}

module.exports = AutomatorUtilities;