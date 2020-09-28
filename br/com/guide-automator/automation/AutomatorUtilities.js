const MouseSimulator = require('./MouseSimulator');
const util = require('../libs/Util');

class AutomatorUtilities {

    constructor (page) {
        this.page = page;
        this.mouseSimulator = new MouseSimulator(this.page);
        this.page.exposeFunction("sleep", util.sleep);
    }

    async screenshotImpl(path) {
        await this.page.screenshot(
            {
                path: path
            });
    }

    async screenshotOfEntire(path) {
        await this.screenshotImpl(path);
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
        await this.waitForTransitionEnd(arguments[0]);
        await this.moveCursorToSelector(arguments[0]);
        await this.screenshotImpl(arguments[2]);
    }

    async waitForTransitionEnd(selector) {
        if(selector){
            await this.page.waitForSelector(selector);
        }
        await this.page.evaluate((selector) => {
                const dom = document.querySelector(selector) || document.body;
                if(!dom) {
                    throw new Error('Failed to find DOM');
                }
                const onEnd = () => {
                    dom.removeEventListener('transitionend', onEnd);
                };
                dom.addEventListener('transitionend', onEnd);
        }, selector);
    }

    async moveCursorToSelector(selector) {
        const el = await this.page.$(selector);
        const boundingBox = await el.boundingBox();
        await this.mouseSimulator.
            moveCursorToCoordinates(boundingBox);
    }

    async autoScroll(){
        console.log(typeof util.sleep)
        await this.page.evaluate(async () => {
            const distance = 100;
            const delay = 100;
            while (document.scrollingElement.scrollTop +
                 window.innerHeight <
                 document.scrollingElement.scrollHeight) {
              document.scrollingElement.scrollBy(0, distance);
              await sleep(delay);
            }
        });
    }
}

module.exports = AutomatorUtilities;