const puppeteer = require('puppeteer');

class InterpreterProxy {

    browser = null;
    page = null;

    constructor() {
        this.parseFuncs();
    }

    async $init() {
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

    async $close(){
        console.log("closed");
        await this.browser.close();
    }

    async $screenshot(url, selector, path) {  
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
            let callback = args[args.length-1];
            console.log(`TIPO: ${typeof callback}`);
            if(callback && typeof callback === 'function'){
                callback(err);
            }
            return result;
        }
    }

    parseFuncs() {
        let methods = Object.getOwnPropertyNames(InterpreterProxy.prototype).
            filter(m => m.startsWith('$'));
        console.log(`METHODS: ${JSON.stringify(methods)}`);
        for(let m of methods) {
            console.log(`SINGLE METHOD: ${m}`);
            let methodName = m.replace('$', '');
            InterpreterProxy.prototype[methodName] = async (...args) => {
                return await this.proxy(m, args)}
        }
    }
}

module.exports = InterpreterProxy;