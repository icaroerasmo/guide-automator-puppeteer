const InterpreterProxy = require('./AutomatorProxy');
const puppeteer = require('puppeteer');

class Automator extends InterpreterProxy {

    async init() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            ]
        });
        this.page = await this.browser.newPage();
        console.log("initialized");
        return this;
    }

    async close(){
        console.log("closed");
        await this.browser.close();
    }

    async goToPage(url) {
        if(url){
            console.log(`URL: ${url}`);
            await this.page.goto(url);
        }
        return this;
    }

    async screenshot(selector, path) {  
        if(selector){
            console.log(`SELECTOR: ${selector}`);
            await this.page.evaluate((selector) => {
                const dom = document.querySelector(selector);
                if(dom){
                    dom.scrollIntoView();
                }    
            }, selector);
        }
        console.log(`PATH: ${path}`);
        await this.page.screenshot({path: path});
        return this;
    }

    async fillField(selector, content){
        await this.page.type(selector, content);
        return this;
    }

    async submitForm(selector){
        await this.page.$eval(selector, form => form.submit());
        return this;
    }

    async clickButton(selector){
        await this.page.click(selector);
        return this;
    }

    async waitForPageToLoad() {
        await this.page.waitForNavigation({waitUntil: 'load'});
        return this;
    }
}

module.exports = {
    instance() {
        return new Automator().init();
    }
}