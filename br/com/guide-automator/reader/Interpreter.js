const { performance } = require('perf_hooks');
const fs = require('fs');
const md = require('markdown-it')({ html: true });
const wkhtmltopdf = require('wkhtmltopdf');
const InterpreterProxy = require('./InterpreterProxy')
const Automator = require('../automation/Automator');
const Util = require('../libs/Util');
const { recorder } = require('../libs/Recorder');
const { generateAudio } = require('../libs/SoundEffects');
const converter = require('../libs/ApngToMp4Converter');
const base64Converter = require('image-to-base64');
const { FINAL_VIDEO_NAME, FINAL_VIDEO_FORMAT } = require('../libs/Constants');
const codeMarker = "```"

class Interpreter extends InterpreterProxy{
    
    viewport;
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
            this.isDebugEnabled,
            this.isVerboseEnabled,
            this.resourcesFolder,
            this.tmpFolder
            );

        const runner = async (start, stop) => {
            start(await this.instance.page, this.tmpFolder);
            process.env.startTime = performance.now();
            await this.parseFile();
            await this.makePDF();
            await generateAudio(this.tmpFolder);
            process.env.endTime = performance.now();
            stop();
        };
        this.log('started Recording');
        const videoPngBuffer = await recorder(runner);
        let fileName = `${FINAL_VIDEO_NAME}.${FINAL_VIDEO_FORMAT}`;
        fs.writeFileSync(`${this.tmpFolder}/${fileName}`, videoPngBuffer, () => {});
        await converter(fileName, this.tmpFolder, this.outputFolder);
        this.log('finished Recording');
    }
    
    checkParameters() {

        let checkFilesExistence = (filePath) => {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Path not found: ${filePath}`);
            }
        }

        if(this.mdFile){
            this.log(`MD file name: ${this.mdFile}`);
            checkFilesExistence(this.mdFile);
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
            checkFilesExistence(this.resourcesFolder);
        }

        if(this.coverPath){
            this.log(`cover path: ${this.coverPath}`);
            checkFilesExistence(this.coverPath);
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
        let i = 0;
        while(i < this.mdContent.length){
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
            i++;
        }
    }

    async viewportAdjustment(lines) {
        let index = 0;
        let arr = [];
        let i = 0;
        while(i < lines.length) {
            const line = lines[i++];
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
        let i = 0;
        while(i < lines.length) {
            const params = Util.splitCommandLine(lines[i++]);
            switch(params[0]) {
                case 'go-to-page':
                    await this.instance.goToPage(params[1]);
                    break;
                case 'screenshot':
                    const printName =
                     `${this.tmpFolder}/print_${this.printCounter++}.png`;
                    
                    await this.instance.screenshot(
                        ...params.slice(1), printName);

                    output +=   `<p class="img-wrapper">`+
                                `   <img src="data:image/png;base64,${await base64Converter(printName)}">`+
                                `   <em>${params[2] || params[1]}</em>`+
                                `</p>`;

                    break;
                case 'fill-field':
                    await this.instance.fillField(params[1], params[2]);
                    break;
                case 'submit-form':
                    await this.instance.submitForm(params[1]);
                    break;
                case 'click':
                    await this.instance.click(params[1]);
                    break;
                case 'select':
                    await this.instance.select(params[1], params[2])
                    break;
                case 'viewport':
                    await this.instance.viewport(params[1], params[2])
                    break;
                case 'speak':
                    await this.instance.speak(params[1]);
                    break;
                default:
                    throw new Error('Command not recognized');
            }
        }

        return output;
    }

    makePDF() {

        const options = {
            encoding: 'UTF-8',
            cover: this.coverPath,
            pageSize: 'A4',
            toc: true,
            tocHeaderText: 'Índice',
            output: `${this.outputFolder}/${this.outputFileName}.pdf`,
            'user-style-sheet': `${this.resourcesFolder}/styles.css`,
            footerLeft: '[page]'
        };

        this.log('rendering HTML...');
        const html = md.render(this.mdContent);

        this.log('building PDF...');
        wkhtmltopdf(html, options);
    }
}
module.exports = Interpreter;