const puppeteer = require('puppeteer');

class Interpreter {

    browser = null;
    page = null;

    constructor(){
        
    }

    async _init() {
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

    async _close(){
        console.log("closed");
        await this.browser.close();
    }

    async _screenshot(url, selector, path) {  
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

    async init() {
       return await this.proxy('_init', arguments);
    }

    async screenshot() {
        return await this.proxy('_screenshot', arguments);
    }

    async close() {
        return await this.proxy('_close', arguments);
    }

    async proxy(methodName, args){
        let err;
        let result;
        try{
            console.log(`ARGS: ${JSON.stringify(arguments)}`);
            result = await this[methodName].apply(this, args);
        } catch(e) {
            console.log(`ERRO: ${e}`);
            err = e;
        } finally {
            let callback = arguments[arguments.length-1];
            if(callback && typeof callback === 'function'){
                callback(err);
            }
            return result;
        }
    }
}

module.exports = {
    instance() {
        return new Interpreter().init();
    }
}