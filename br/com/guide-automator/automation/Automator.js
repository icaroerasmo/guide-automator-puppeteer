const AutomatorProxy = require('./AutomatorProxy');
const puppeteer = require('puppeteer');
const md = require('markdown-it')({html: true});
const wkhtmltopdf = require('wkhtmltopdf');

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
        this.page.setViewport({width: width, height: height});
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
        await this.page.waitForNavigation({waitUntil: 'networkidle0'});
        return this;
    }

    async click(selector){
        console.log(`Click button: ${selector}`)
        await this.page.click(selector);
        return this;
    }

    async wait(amount) {
        console.log(`Waiting for ${amount} milisseconds`)
        await new Promise(resolve => setTimeout(resolve, amount));
        return this;
    }

    // async makePDF(content, cssPath, outputFilePath) {

    //     console.log("Save content as PDF");

    //     const html = md.render(content);

    //     console.log('CONTENT:\n')
    //     console.log(html)

    //     await this.page.setViewport({width: 2732, height: 1536, deviceScaleFactor: 2});
    //     await this.page.setContent(html, { waitUntil: 'networkidle0' });
    //     await this.page.addStyleTag({path: cssPath});
    //     await this.page.pdf({
    //         path: outputFilePath,
    //         format: 'A4',
    //         printBackground: true,
    //         displayHeaderFooter: true,
    //         headerTemplate: "",
    //         footerTemplate: "<h1 style='font-size: 12px;width: 100%;margin-left: 20px;'><span class='pageNumber'></span></div>",
    //         margin: { left: '2cm', top: '2cm', right: '1cm', bottom: '2.5cm' }       
    //     });
    // }

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