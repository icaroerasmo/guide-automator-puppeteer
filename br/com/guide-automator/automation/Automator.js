const AutomatorProxy = require('./AutomatorProxy');
const MouseSimulator = require('./MouseSimulator');
const puppeteer = require('puppeteer');
const md = require('markdown-it')({ html: true });
const wkhtmltopdf = require('wkhtmltopdf');
const mouseHelper = require('../libs/MouseHelper');

class Automator extends AutomatorProxy {

    constructor(isDebugEnabled, isVerboseEnabled) {
        super(isDebugEnabled, isVerboseEnabled)
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            defaultViewport: null
        });
        this.page = await this.browser.newPage();
        this.page.setCacheEnabled(false);
        this.log("initialized");
        return this;
    }

    async viewport(width, height) {
        this.log(`setting viewport: width(${width}) height(${height})`);
        await this.page.setViewport({ width: Number(width), height: Number(height) });
        return this;
     }

    async goToPage(url) {
        this.log(`going to page: "${url}"`);
        await mouseHelper(this.page);
        await this.page.goto(url, {waitUntil: 'networkidle2'});
        return this;
    }

    async screenshot() {
        if(arguments[0] && arguments[2]){
            this.log(`screenshot from selector: selector("${arguments[0]}")` +
            ` path("${arguments[2]}")`);
            return this.screenshotFromSelector(...arguments);
        } else {
            this.log(`screenshot of whole page: path("${arguments[1]}")`);
            return this.screenshotOfEntire(arguments[1]);
        }
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

    async fillField(selector, content) {
        this.log(`setting text to input: selector("${selector}") text("${content}")`)
        await this.page.waitForSelector(selector);
        await this.moveCursorToSelector(selector);
        await this.page.type(selector, content);
        return this;
    }

    async submitForm(selector) {
        this.log(`submitting form: selector("${selector}")`)
        await this.page.$eval(selector, form => form.submit());
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
        return this;
    }

    async click(clickSelector, timeout) {
        await this.page.waitForSelector(clickSelector);
        await this.moveCursorToSelector(clickSelector);
        this.log(`clicking: selector("${clickSelector}")`);
        let href = await this.page.$eval(clickSelector,
             href => href.getAttribute('href'));
        if(!href || href === '#') {
            await this.page.click(clickSelector);
            let hasTimedOut = await this.waitForTransitionEnd(timeout);
            if(hasTimedOut) {
                this.log(`click action has timed out!!! selector: "${clickSelector}"`);
            }
        } else {
            this.debug(`href attribute found: ${href}`);
            this.debug(`going to page: ${href}`);
            await this.page.goto(href, { waitUntil: 'networkidle2' });
        }
        return this;
    }

    async select(selector, value) {
        this.log(`setting value to select: selector("${selector}") value("${value}")`)
        await this.page.waitForSelector(selector);
        await this.moveCursorToSelector(selector);
        await this.page.select(selector, value);
        return this;
    }

    async moveCursorToSelector(selector) {
        const el = await this.page.$(selector);
        const boundingBox = await el.boundingBox();
        return await new MouseSimulator(this.page).
            moveCursorToCoordinates(boundingBox);
    }

    async autoScroll(){
        await this.page.evaluate(async () => {
            const distance = 100;
            const delay = 100;
            while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
              document.scrollingElement.scrollBy(0, distance);
              await new Promise(resolve => { setTimeout(resolve, delay); });
            }
        });
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
                    timeout = 10000;
                }
                setTimeout(() => {
                    dom.removeEventListener('transitionend', onEnd);
                    resolve(true);
                }, timeout);
                dom.addEventListener('transitionend', onEnd);
            });
        }, timeout, selector);
    }

    async makePDF(content, coverPath, cssPath, outputFilePath) {

        const options = {
            encoding: 'UTF-8',
            cover: coverPath,
            pageSize: 'A4',
            toc: true,
            tocHeaderText: 'Índice',
            output: outputFilePath,
            'user-style-sheet': cssPath,
            footerLeft: '[page]'
        };

        this.log('rendering HTML...');
        const html = md.render(content);

        this.log('building PDF...');
        wkhtmltopdf(html, options);
    }

    async close() {
        this.log("closing browser...");
        await this.browser.close();
    }

    getPage(){
        return this.page;
    }
}

module.exports = {
    instance(isDebugEnabled, isVerboseEnabled) {
        return new Automator(isDebugEnabled, isVerboseEnabled).init();
    }
}