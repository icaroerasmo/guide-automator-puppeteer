const fs = require('fs');
const InterpreterProxy = require('main/reader/InterpreterProxy')
const Automator = require('main/automation/Automator');
const Util = require('main/libs/Util');
const base64Converter = require('image-to-base64');

class Interpreter extends InterpreterProxy{
    
    printCounter = 1
    codeMarker = "```"

    constructor() {
        super();
        this.mdFile = null;
        this.mdContent = null;
        this.outputFolder = './'
        this.outputFileName = 'output.pdf'
        this.resourcesFolder = './resources'
        this.tmpFolder = `${this.resourcesFolder}/tmp`;
    }

    async run(argv) {
        if(!fs.existsSync(this.tmpFolder)) {
            fs.mkdirSync(this.tmpFolder);
        }
        this.instance = await Automator.instance();
        this.readParameters(argv);
        await this.parseFile();
        await this.instance.makePDF(this.mdContent,
            `${this.resourcesFolder}/styles.css`,
            `${this.outputFolder}/${this.outputFileName}`);
    }

    readParameters(argv){
        for(let i = 2; i < argv.length; i++) {
            this.parametersInterpreter(argv[i++], argv[i]);
        }
    }

    async parseFile() {
        let stack = [];
        this.mdContent = fs.readFileSync(this.mdFile, 'utf8');
        for(let i = 0; i < this.mdContent.length; i++){
            
            const j = i + this.codeMarker.length;

            let substring = this.mdContent.substring(i, j);

            if(substring === this.codeMarker) {
                if(stack.length == 0){
                    stack.push(i);
                } else {
                    const start = stack.pop();
                    const code = this.mdContent.substring(start+this.codeMarker.length, i);

                    let output = await this.runCommand(code);

                    this.mdContent = Util.replaceAt(start, j, this.mdContent, output);

                    i = start;
                }
            }
        }
    }

    async runCommand(code) {
        let output = '';
        const lines = code.split('\n');
        for(let line of lines) {
            const params = line.split(/\s+/g);
            console.log(`PARAMS: ${JSON.stringify(params)}`)
            switch(params[0]) {
                case 'go-to-page':
                    await this.instance.goToPage(params[1]);
                    break;
                case 'screenshot':
                    const printName =
                     `${this.tmpFolder}/print${this.printCounter++}.png`;
                    await this.instance.screenshot(
                        params[1], printName);
                    output = `| ![${params.slice(2).join(' ')}](data:image/png;base64,`+
                        `${await base64Converter(printName)}) |\n|:--:|\n| *${params.slice(2).join(' ')}* |`;
                    console.log(`OUTPUT: ${output}`)
                    break;
                case 'fill-field':
                    await this.instance.fillField(params[1],
                         params.slice(2).join(' '));
                    break;
                case 'submit-form':
                    await this.instance.submitForm(params.slice(1).join(' '));
                    break;
                case 'click-button':
                    await this.instance.clickButton(params.slice(1).join(' '));
                    break;
                case '':
                    break;
                default:
                    throw new Error('Command not recognized');
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