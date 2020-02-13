const AutomatorProxy = require('./AutomatorProxy');
const puppeteer = require('puppeteer');

class Automator extends AutomatorProxy {

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
        console.log("Close browser");
        await this.browser.close();
    }

    async goToPage(url) {
        console.log(`Go to page: ${url}`);
        await this.page.goto(url);
        return this;
    }

    async screenshot(selector, path) {  
        if(selector){
            console.log(`Take screenshot of: ${selector}`);
            await this.page.evaluate((selector) => {
                const dom = document.querySelector(selector);
                if(dom){
                    dom.scrollIntoView();
                }    
            }, selector);
        }
        console.log(`Save in: ${path}`);
        await this.page.screenshot({path: path});
        return this;
    }

    async fillField(selector, content){
        console.log(`Fill field: ${selector} = ${content}`)
        await this.page.type(selector, content);
        return this;
    }

    async submitForm(selector){
        console.log(`Submit form: ${selector}`)
        await this.page.$eval(selector, form => form.submit());
        await this.page.waitForNavigation({waitUntil: 'networkidle2'});
        return this;
    }

    async clickButton(selector){
        console.log(`Click button: ${selector}`)
        await this.page.click(selector);
        return this;
    }
}

module.exports = {
    instance() {
        return new Automator().init();
    }
}