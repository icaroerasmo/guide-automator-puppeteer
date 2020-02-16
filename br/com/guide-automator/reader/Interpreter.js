const fs = require('fs');
const InterpreterProxy = require('main/reader/InterpreterProxy')
const Automator = require('main/automation/Automator');
const Util = require('main/libs/Util');

class Interpreter extends InterpreterProxy{
    
    codeMarker = "```"

    constructor() {
        super();
        this.mdFile = null;
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
        await this.parseFile();
    }

    readParameters(argv){
        for(let i = 2; i < argv.length; i++) {
            this.parametersInterpreter(argv[i++], argv[i]);
        }
    }

    async parseFile() {
        let stack = [];
        let mdContent = fs.readFileSync(this.mdFile, 'utf8');
        for(let i = 0; i < mdContent.length; i++){
            
            const j = i + this.codeMarker.length;

            let substring = mdContent.substring(i, j);

            if(substring === this.codeMarker) {
                if(stack.length == 0){
                    stack.push(i);
                } else {
                    const start = stack.pop();
                    const code = mdContent.substring(start+this.codeMarker.length, i);

                    const output = await this.runCommand(code);

                    mdContent = Util.replaceAt(start, j, mdContent, output);

                    i = start;
                }
            }
        }
        console.log(mdContent);
        return mdContent;
    }

    async runCommand(code) {
        let output = 'TESTE 123';
        const lines = code.split('\n');
        for(let line of lines) {
            const params = line.split('\s+');
            switch(params[0]) {
                case 'go-to-page':
                    break;
                case 'screenshot':
                    break;
                case 'fill-field':
                    break;
                case 'submit-form':
                    break;
                case 'click-button':
                    break;
                case 'make-pdf':
                    break;
                default:
                    break;
            }
        }
        return output;
    }

    parametersInterpreter(key, val) {
        switch(key) {
            case '-i':
                this.mdFile = val;
                console.log(`MD file name: ${this.mdFile}`);
                return
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