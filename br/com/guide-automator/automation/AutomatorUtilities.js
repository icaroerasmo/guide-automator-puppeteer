const { performance } = require('perf_hooks');
const MouseSimulator = require('./MouseSimulator');
const mouseHelper = require('../libs/MouseHelper');
const util = require('../libs/Util');

class AutomatorUtilities {

    constructor (instance) {
        this.instance = instance;
        this.page = this.instance.page;
        this.mouseSimulator = new MouseSimulator(this.page);
        mouseHelper(this.page);
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

    async writeToInput(selector, text) {
        for(let i = 0; i < text.length; i++) {
            await this.page.type(selector, text[i]);
            let checkpoint = performance.now();
            if(i < text.length-1) {
                await util.sleep(util.randomNum(142, 500));
            }
            let finalChk = performance.now();
            await this.instance.effectsTimeline.push({
                checkpoint,
                finalChk,
            });
        }
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

                let resolve, reject;

                let deferred = new Promise((_resolve, _reject) => {
                    resolve = _resolve;
                    reject = _reject;
                });

                const dom = document.querySelector(selector) || document.body;
                
                if(!dom) {
                    throw new Error('Failed to find DOM');
                }

                let counter = 0;

                const goOn = () => {
                    dom.removeEventListener('transitionend', onEnd);
                    resolve();
                }

                const onEnd = () => {
                    if(counter++ > 0){
                        goOn();
                    }
                };

                dom.addEventListener('transitionend', onEnd);

                setTimeout(goOn, 5000);

                return deferred;
        }, selector);
    }

    async moveCursorToSelector(selector) {
        const el = await this.page.$(selector);
        const boundingBox = await el.boundingBox();
        await this.mouseSimulator.
            moveCursorToCoordinates(boundingBox);
    }

    async autoScroll(){
        await this.page.exposeFunction("sleep", util.sleep);
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