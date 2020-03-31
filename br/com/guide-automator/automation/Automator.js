const AutomatorProxy = require('./AutomatorProxy');
const puppeteer = require('puppeteer');
const md = require('markdown-it')({ html: true });
const wkhtmltopdf = require('wkhtmltopdf');
const measure = /^\-?\d+(\.\d+)?$/g;

class Automator extends AutomatorProxy {

    async init() {
        const width = 1366;
        const height = 768;
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                `--window-size=${width},${height}`
            ]
        });
        this.page = await this.browser.newPage();
        this.page.setCacheEnabled(false);
        this.page.setViewport({ width: width, height: height });
        console.log("initialized");
        return this;
    }

    async close() {
        console.log("Close browser");
        await this.browser.close();
    }

    async goToPage(url) {
        console.log(`Go to page: ${url}`);
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
            return this.screenshotFromClip(...newArgs);
        } else if(arguments[0] && arguments[2]){
            return this.screenshotFromSelector(...arguments);
        } else {
            return this.screenshotOfEntire(arguments[1]);
        }
    }

    async screenshotFromClip(width, height, left, top, path) {
        const padding = 0;
        let clip = null;
        console.log(`Save in: ${path}`);
        console.log(width, height, left, top, path);
        if(width && height && left && top && path) {
            clip = {
                x: Number(left) - padding,
                y: Number(top) - padding,
                width: Number(width) + padding * 2,
                height: Number(height) + padding * 2
            } 
        }
        await this.page.screenshot(
            {
                path: path,
                clip: clip
            });
        return this;
    }

    async screenshotOfEntire(path) {
        return await this.screenshotFromClip(null, null, null, null, path);
    }

    async screenshotFromSelector() {
        console.log(`Take screenshot of: ${arguments[0]}`);
        const rect = await this.page.evaluate(selector => {
            const element = document.querySelector(selector);
            if (!element)
                return null;
            const {x, y, width, height} = element.getBoundingClientRect();
            return {width, height, left: x, top: y};
        }, arguments[0]);
        return await this.screenshotFromClip(...Object.values(rect), arguments[2]);
    }

    async fillField(selector, content) {
        console.log(`Fill field: ${selector} = ${content}`)
        await this.page.type(selector, content);
        return this;
    }

    async submitForm(selector) {
        console.log(`Submit form: ${selector}`)
        await this.page.$eval(selector, form => form.submit());
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
        return this;
    }

    async click(clickSelector, timeout) {
        console.log(`Click button: ${clickSelector}`)
        let href = await this.page.$eval(clickSelector,
             href => href.getAttribute('href'));
        console.log(`HREF: ${href}`);
        if(!href || href === '#') {
            await this.page.click(clickSelector);
            let hasTimedOut = await this.waitForTransitionEnd(timeout);
            if(hasTimedOut) {
                console.log(`Click action on ${clickSelector} has timed out!!!`);
            }
        } else {
            await this.page.goto(href, { waitUntil: 'networkidle2' });
        }
        return this;
    }

    async select(selector, value) {
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

        console.log("Save content as PDF");

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

        console.log('Rendering HTML');
        const html = md.render(content);

        console.log('Building PDF');

        wkhtmltopdf(html, options);
    }
}

module.exports = {
    instance() {
        return new Automator().init();
    }
}