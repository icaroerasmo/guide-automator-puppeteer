const AutomatorProxy = require('./AutomatorProxy');
const puppeteer = require('puppeteer');
var md = require('markdown-it')();

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
        this.page.setViewport({width:1366, height: 768});
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

    async makePDF(content, outputFilePath) {

        console.log("Save content as PDF");

        const html = md.render(content);

        console.log('CONTENT:\n')
        console.log(html)

        await this.page.setViewport({width: 1600, height: 1200, deviceScaleFactor: 2});
        await this.page.setContent(html, { waitUntil: 'networkidle0' })
        await this.page.pdf({
            path: outputFilePath,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: "",
            footerTemplate: "<h1 style='font-size: 12px;width: 100%;margin-left: 5px;'><span class='pageNumber'></span></div>",
            margin: { left: '2cm', top: '3cm', right: '1cm', bottom: '2.5cm' }       
        });
    }
}

module.exports = {
    instance() {
        return new Automator().init();
    }
}