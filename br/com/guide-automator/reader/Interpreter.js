const fs = require('fs');
const InterpreterProxy = require('main/reader/InterpreterProxy')
const Automator = require('main/automation/Automator');

class Interpreter extends InterpreterProxy{
    
    constructor() {
        super();
        this.outputFolder = './'
        this.outputFileName = 'output.pdf'
        this.resourcesFolder = './resources'
    }

    // static async run() {
    //     console.log(`ARGUMENTS: ${JSON.stringify(process.argv)}`);
    //     let instance = await Automator.instance();
    //     instance = await instance.goToPage('https://google.com/')
    //     instance = await instance.fillField('[name=q]', 'Hello World');
    //     instance = await instance.submitForm('#tsf')
    //     instance = await instance.screenshot(null, 'test.png',
    //      (err)=>{
    //             if(!err) {
    //                 console.log('took screenshot');
    //             }
    //         });
    //     await instance.makePDF(fs.readFileSync('./example.md', 'utf8'));
    //     instance = await instance.close(); 
    // }

    async run(argv) {
        this.instance = await Automator.instance();
        this.readParameters(argv);
    }

    readParameters(argv){
        for(let i = 2; i < argv.length; i++) {
            this.parametersInterpreter(argv[i++], argv[i]);
        }
    }

    async parseFile() {
        
    }

    parametersInterpreter(key, val) {
        switch(key) {
            case '-f':
                this.outputFileName = val;
                console.log(`Output file name: ${this.outputFileName}`);
                return
            case '-o':
                this.outputFolder = val;
                console.log(`Output folder: ${this.outputFolder}`);
                return;
            case '-r':
                this.resourcesFolder = val;
                console.log(`Resources folder: ${this.resourcesFolder}`);
                return;
            default:
                throw new Error(`Parameter \'${key}\' wasn\'t recognized`);
        }
    }
}
module.exports = Interpreter;