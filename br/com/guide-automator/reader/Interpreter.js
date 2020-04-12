const fs = require('fs');
const InterpreterProxy = require('main/reader/InterpreterProxy')
const Automator = require('main/automation/Automator');
const Util = require('main/libs/Util');
const nodePuppeteerApng = require('node-puppeteer-apng');
const base64Converter = require('image-to-base64');

class Interpreter extends InterpreterProxy{
    
    printCounter = 1
    codeMarker = "```"

    constructor() {
        super();
        this.mdFile = null;
        this.mdContent = null;
        this.coverPath = null;
        this.outputFolder = './';
        this.outputFileName = 'output';
        this.resourcesFolder = './resources';
        this.tmpFolder = `${this.resourcesFolder}/tmp`;
    }

    async run(argv) {
        if(!fs.existsSync(this.tmpFolder)) {
            fs.mkdirSync(this.tmpFolder);
        }
        this.instance = await Automator.instance();
        this.readParameters(argv);
        const runner = async (start, stop) => {
            start(await this.instance.getPage());
            await this.parseFile();
            await this.instance.makePDF(this.mdContent,
                this.coverPath,
                `${this.resourcesFolder}/styles.css`,
                `${this.outputFolder}/${this.outputFileName}.pdf`);
            stop();
        };
        const buffer = await nodePuppeteerApng(runner);
        fs.writeFile(`${this.outputFolder}/video_${this.outputFileName}.png`, buffer, ()=>{});
    }

    readParameters(argv){
        for(let i = 2; i < argv.length; i++) {
            this.parametersInterpreter(argv[i++], argv[i]);
        }
        if(!this.mdFile) {
            throw new Error('MD file path was not defined.');
        }
        if(!this.coverPath) {
            throw new Error('Cover file path was not defined.');
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

    async viewportAdjustment(lines) {
        let index = 0;
        console.log(`LINES2: ${lines}`);
        let arr = [];
        for(let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if(line.includes('viewport')){
                arr.splice(index++, 0, line);
            } else {
                arr.push(line);
            }
        }
        return arr;
    }

    async runCommand(code) {
        let output = '';
        let lines = Util.splitCodeIntoLines(code);
        lines = await this.viewportAdjustment(lines);
        console.log(`LINES: ${lines}`);
        for(let line of lines) {
            const params = Util.splitCommandLine(line);
            console.log(`PARAMS: ${JSON.stringify(params)}`)
            switch(params[0]) {
                case 'go-to-page':
                    await this.instance.goToPage(params[1]);
                    break;
                case 'screenshot':
                    const printName =
                     `${this.tmpFolder}/print${this.printCounter++}.png`;
                    
                    await this.instance.screenshot(
                        ...params.slice(1), printName);

                    output +=   `<p class="img-wrapper">`+
                                `   <img src="data:image/png;base64,${await base64Converter(printName)}">`+
                                `   <em>${params[5] || params[2] || params[1]}</em>`+
                                `</p>`;

                    break;
                case 'fill-field':
                    await this.instance.fillField(params[1],
                         params[2]);
                    break;
                case 'submit-form':
                    await this.instance.submitForm(params[1]);
                    break;
                case 'click':
                    await this.instance.click(params[1], params[2]);
                    break;
                case 'select':
                    await this.instance.select(params[1], params[2])
                    break;
                case 'viewport':
                    await this.instance.viewport(params[1], params[2])
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
            case '-cv':
                this.coverPath = val;
                console.log(`Cover path: ${this.coverPath}`);
                return;
            default:
                throw new Error(`Parameter \'${key}\' wasn\'t recognized`);
        }
    }
}
module.exports = Interpreter;