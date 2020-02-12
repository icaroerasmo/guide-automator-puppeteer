const InterpreterProxy = require('./InterpreterProxy');
const puppeteer = require('puppeteer');

class Interpreter extends InterpreterProxy {
    
    constructor() {
        super();
    }

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

    async screenshot(url, selector, path) {  
        if(url){
            console.log(`URL: ${url}`);
            console.log(`SELECTOR: ${selector}`);
            console.log(`PATH: ${path}`);
            await this.page.goto(url);
        }

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
}

module.exports = {
    instance() {
        return new Interpreter().init();
    }
}