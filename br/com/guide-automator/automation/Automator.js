const AutomatorProxy = require('./AutomatorProxy');
const puppeteer = require('puppeteer');
const md = require('markdown-it')({ html: true });
const wkhtmltopdf = require('wkhtmltopdf');
const measure = /^\-?\d+(\.\d+)?$/g;

class Automator extends AutomatorProxy {

    constructor(isDebugEnabled, isVerboseEnabled) {
        super(isDebugEnabled, isVerboseEnabled)
    }

    async init() {
        // const width = 1366;
        // const height = 768;
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                // `--window-size=${width},${height}`
            ],
            defaultViewport: null
        });
        this.page = await this.browser.newPage();
        this.page.setCacheEnabled(false);
        // this.page.setViewport({ width: width, height: height });
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
        await this.page.goto(url, {waitUntil: 'networkidle2'});
        return this;
    }

    async screenshot() {
        if((arguments[0] && arguments[0].match(measure)) &&
            (arguments[1] && arguments[1].match(measure)) &&
            (arguments[2] && arguments[2].match(measure)) &&
            (arguments[3] && arguments[3].match(measure))) {
            let newArgs = Object.values(arguments).slice(0,4);
            newArgs.push(arguments[5]);
            this.log(`screenshot from clip: width("${newArgs[0]}")` +
            ` height("${arnewArgsguments[1]}") left("${newArgs[2]}")` +
            ` top("${newArgs[3]}") path("${newArgs[4]}")`);
            return this.screenshotFromClip(...newArgs);
        } else if(arguments[0] && arguments[2]){
            this.log(`screenshot from selector: selector("${arguments[0]}")` +
            ` path("${arguments[2]}")`);
            return this.screenshotFromSelector(...arguments);
        } else {
            this.log(`screenshot of whole page: path("${arguments[1]}")`);
            return this.screenshotOfEntire(arguments[1]);
        }
    }

    async screenshotFromClip(width, height, left, top, path) {
        const padding = 0;
        let clip = null;
        if(width && height && left && top && path) {
            clip = {
                x: Number(left) - padding,
                y: Number(top) - padding,
                width: Number(width) + padding * 2,
                height: Number(height) + padding * 2
            };
        }
        await this.page.screenshot(
            {
                path: path,
                clip: clip
            });
        return this;
    }

    screenshotOfEntire(path) {
        return this.screenshotFromClip(null, null, null, null, path);
    }

    async screenshotFromSelector() {
        const rect = await this.page.evaluate(selector => {
            const element = document.querySelector(selector);
            if (!element)
                throw new Error(`Selector '${selector}' not found`)
            const {x, y, width, height} = element.getBoundingClientRect();
            return {width, height, left: x, top: y};
        }, arguments[0]);
        await this.page.evaluate(rect => {
            window.scrollTo(rect.left, rect.top);
        }, rect);
        return this.screenshotFromClip(...Object.values(rect), arguments[2]);
    }

    async fillField(selector, content) {
        this.log(`setting text to input: selector("${selector}") text("${content}")`)
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
        this.log(`clicking: selector("${clickSelector}")`)
        let href = await this.page.$eval(clickSelector,
             href => href.getAttribute('href'));
        this.debug(`href attribute found: ${href}`);
        if(!href || href === '#') {
            await this.page.click(clickSelector);
            let hasTimedOut = await this.waitForTransitionEnd(timeout);
            if(hasTimedOut) {
                this.log(`click action has timed out!!! selector: "${clickSelector}"`);
            }
        } else {
            this.debug(`going to page: ${href}`);
            await this.page.goto(href, { waitUntil: 'networkidle2' });
        }
        return this;
    }

    async select(selector, value) {
        this.log(`setting value to select: selector("${selector}") value("${value}")`)
        await this.page.select(selector, value);
        return this;
    }

    async waitForTransitionEnd(timeout) {
        return this.page.evaluate((timeout) => {
            return new Promise((resolve) => {
                const onEnd = () => {
                    document.removeEventListener('transitionend', onEnd);
                    resolve(false);
                };
                if(!timeout || typeof timeout !== 'number'){
                    timeout = 10000;
                }
                setTimeout(() => {
                    resolve(true);
                }, timeout);
                document.addEventListener('transitionend', onEnd);
            });
        }, timeout);
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