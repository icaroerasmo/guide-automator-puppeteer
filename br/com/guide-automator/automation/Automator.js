const AutomatorProxy = require('./AutomatorProxy');
const AutomatorUtilities = require('./AutomatorUtilities');
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
        this.automatorUtilities = new AutomatorUtilities(this.page);
         await mouseHelper(this.page);
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
        if(arguments[0] && arguments[2]){
            this.log(`screenshot from selector: selector("${arguments[0]}")` +
            ` path("${arguments[2]}")`);
            return this.automatorUtilities.screenshotFromSelector(...arguments);
        } else {
            this.log(`screenshot of whole page: path("${arguments[1]}")`);
            return this.automatorUtilities.screenshotOfEntire(arguments[1]);
        }
    }

    async fillField(selector, content) {
        this.log(`setting text to input: selector("${selector}") text("${content}")`)
        await this.page.waitForSelector(selector);
        await this.automatorUtilities.moveCursorToSelector(selector);
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
        await this.automatorUtilities.moveCursorToSelector(clickSelector);
        this.log(`clicking: selector("${clickSelector}")`);
        let href = await this.page.$eval(clickSelector,
             href => href.getAttribute('href'));
        if(!href || href === '#') {
            await this.page.click(clickSelector);
            let hasTimedOut = await this.automatorUtilities.waitForTransitionEnd(timeout);
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
        await this.automatorUtilities.moveCursorToSelector(selector);
        await this.page.select(selector, value);
        return this;
    }

    getPage(){
        return this.page;
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
}

module.exports = {
    instance(isDebugEnabled, isVerboseEnabled) {
        return new Automator(isDebugEnabled, isVerboseEnabled).init();
    }
}