const fs = require('fs');
const InterpreterProxy = require('main/reader/InterpreterProxy')
const Automator = require('main/automation/Automator');

class Interpreter extends InterpreterProxy{
    
    constructor() {
        super();
    }

    static async run() {
        console.log(`ARGUMENTS: ${JSON.stringify(process.argv)}`);
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
    }
}
module.exports = {
    run: Interpreter.run
};