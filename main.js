const fs = require('fs');
const Automator = require('main/automation/Automator');

(async () => {
    let instance = await Automator.instance();
    instance = await instance.goToPage('https://google.com/')
    instance = await instance.fillField('[name=q]', 'Hello World');
    instance = await instance.submitForm('#tsf')
    instance = await instance.screenshot(null, 'test.png',
     (err)=>{
            if(!err) {
                console.log('took screenshot');
            }
        });
    await instance.makePDF(fs.readFileSync('./example.md', 'utf8'));
    instance = await instance.close(); 
})();
