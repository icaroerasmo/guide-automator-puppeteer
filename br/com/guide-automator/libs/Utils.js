const Interpreter = require('main/libs/Interpreter');
module.exports = {
    printsName: (name) => {
        console.log(`My name is ${name}`);
    },
    // async screenshot(url, selector, path, callback) {    
    //     const browser = await puppeteer.launch({
    //         headless: true,
    //         args: [
    //         '--no-sandbox',
    //         '--disable-setuid-sandbox',
    //         ]
    //     });
    //     const page = await browser.newPage();
    //     await page.goto(url);
    //     await page.evaluate((selector) => {
    //         const dom = document.querySelector(selector);
    //         if(dom){
    //             dom.scrollIntoView();
    //         }    
    //     }, selector);
    //     await page.screenshot({path: path});
    //     await browser.close();
    //     callback();
    // }

    async screenshot(url, selector, path, callback) {  
        let inst = await Interpreter.instance();
        inst = await inst.screenshot(url, selector, path, callback);
        inst.close();
    }
};