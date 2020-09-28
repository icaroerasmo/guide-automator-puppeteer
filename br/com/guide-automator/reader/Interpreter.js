const { performance } = require('perf_hooks');
const fs = require('fs');
const md = require('markdown-it')({ html: true });
const nodePuppeteerApng = require('node-puppeteer-apng');
const wkhtmltopdf = require('wkhtmltopdf');
const InterpreterProxy = require('./InterpreterProxy')
const Automator = require('../automation/Automator');
const Util = require('../libs/Util');
const recorder = require('../libs/Recorder');
const converter = require('../libs/ApngToMp4Converter');
const base64Converter = require('image-to-base64');
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
            this.isDebugEnabled, this.isVerboseEnabled);

        const runner = async (start, stop) => {
            start(await this.instance.getPage());
            this.instance.start = performance.now();
            await this.parseFile();
            await this.makePDF();
            await this.generateSubtitles();
            this.instance.end = performance.now();
            stop(this.instance.end);
        };
        this.log('started Recording');
        const videoPngBuffer = await recorder(runner, this.instance.start);
        const filePath = `${this.tmpFolder}/video.png`;
        fs.writeFileSync(filePath, videoPngBuffer, () => {});
        await converter(this.tmpFolder, filePath);
        this.log('finished Recording');
        this.instance.elapsedTime = (this.instance.end - this.instance.start);
        this.log(`Total time: ${this.instance.elapsedTime / 1000} seconds`);
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
                     `${this.tmpFolder}/print_${this.printCounter++}.png`;
                    
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
                    await this.instance.click(params[1]);
                    break;
                case 'select':
                    await this.instance.select(params[1], params[2])
                    break;
                case 'viewport':
                    this.viewport = {width: params[1], height: params[2]};
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

    async generateSubtitles() {
        let sub = await this.instance.getSubtitles();
        let buffer = '';
        for(let i = 0; i < sub.length; i++) {
            let s = sub[i];
            let _beginning = Util.formattedTime(s.checkpoint);
            let _end = Util.formattedTime(s.finalChk);
            buffer += `${i+1}\n${_beginning} --> ${_end}\n${s.sub}\n\n`;
        }

        fs.writeFileSync(`${this.tmpFolder}/subtitles.srt`, buffer, 'utf8', function (err) {});
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