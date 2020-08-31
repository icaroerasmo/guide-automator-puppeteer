const fs = require('fs');
const InterpreterProxy = require('./InterpreterProxy')
const Automator = require('../automation/Automator');
const Util = require('../libs/Util');
const nodePuppeteerApng = require('node-puppeteer-apng');
const base64Converter = require('image-to-base64');
const codeMarker = "```"

class Interpreter extends InterpreterProxy{
    
    printCounter = 1

    constructor(
        mdFile,
        coverPath,
        outputFolder,
        outputFileName,
        resourcesFolder,
        tmpFolder,
        isDebugEnabled,
        isVerboseEnabled
    ) {
        super(isDebugEnabled, isVerboseEnabled);
        this.mdFile = mdFile;
        this.coverPath = coverPath;
        this.outputFolder = outputFolder;
        this.outputFileName = outputFileName;
        this.resourcesFolder = resourcesFolder;
        this.tmpFolder = tmpFolder;
        this.mdContent = null;
    }

    async run() {
        this.checkParameters();
        if(!fs.existsSync(this.tmpFolder)) {
            fs.mkdirSync(this.tmpFolder);
        }
        this.instance = await Automator.instance(
            this.isDebugEnabled, this.isVerboseEnabled);
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
    
    checkParameters() {
        if(this.mdFile){
            this.log(`MD file name: ${this.mdFile}`);
        } else {
            throw new Error('MD file path was not defined.');
        }

        if(this.outputFileName){
            this.log(`output file name: ${this.outputFileName}`);
        }

        if(this.outputFolder){
            this.log(`output folder: ${this.outputFolder}`);
        }

        if(this.resourcesFolder){
            this.log(`resources folder: ${this.resourcesFolder}`);
        }

        if(this.coverPath){
            this.log(`cover path: ${this.coverPath}`);
        } else {
            throw new Error('Cover file path was not defined.');
        }

        if(this.isVerboseEnabled){
            this.log(`verbose enabled`);
        }
        
        if(this.isDebugEnabled){
            this.log(`debug enabled`);
        }
    }

    async parseFile() {
        let stack = [];
        this.mdContent = fs.readFileSync(this.mdFile, 'utf8');
        for(let i = 0; i < this.mdContent.length; i++){
            
            const j = i + codeMarker.length;

            let substring = this.mdContent.substring(i, j);

            if(substring === codeMarker) {
                if(stack.length == 0){
                    stack.push(i);
                } else {
                    const start = stack.pop();
                    const code = this.mdContent.substring(start+codeMarker.length, i);

                    let output = await this.runCommand(code);

                    this.mdContent = Util.replaceAt(start, j, this.mdContent, output);

                    i = start;
                }
            }
        }
    }

    async viewportAdjustment(lines) {
        let index = 0;
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
        for(let line of lines) {
            const params = Util.splitCommandLine(line);
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
                                `   <em>${params[2] || params[1]}</em>`+
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
}
module.exports = Interpreter;