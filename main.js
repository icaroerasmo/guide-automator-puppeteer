#!/usr/bin/env node

;(() => {
    const os = require('os');
    const fs = require('fs');
    const path = require('path');
    const Interpreter = require('./br/com/guide-automator/reader/Interpreter');

    let mdFile = null;
    let coverPath = null;
    let isDebugEnabled = false;
    let isVerboseEnabled = false;
    let outputFolder = './';
    let outputFileName = 'output';
    let resourcesFolder = './resources';

    readParameters = (argv) => {
        for(let i = 2; i < argv.length; i++) {
            const key = argv[i];
            let val = null;
            if(argv[i+1] && !argv[i+1].startsWith('-')) {
                val = argv[++i];
            }
            parametersInterpreter(key, val);
        }
    };

    parametersInterpreter = (key, val) => {
        switch(key) {
            case '-i':
                mdFile = val;
                return
            case '-f':
                outputFileName = val;
                return
            case '-o':
                outputFolder = val;
                return;
            case '-r':
                resourcesFolder = val;
                return;
            case '-cv':
                coverPath = val;
                return;
            case '-v':
                isVerboseEnabled = true;
                return;
            case '-d':
                isDebugEnabled = true;
                return;
            default:
                throw new Error(`Parameter \'${key}\' wasn\'t recognized`);
        }
    };

    readParameters(process.argv);

    fs.mkdtemp(path.join(os.tmpdir(), '/'),
        async (err, tmpFolder) => {
            if (err) throw err;
            await new Interpreter(
                mdFile,
                coverPath,
                outputFolder,
                outputFileName,
                resourcesFolder,
                tmpFolder,
                isDebugEnabled,
                isVerboseEnabled
            ).run();
            fs.rmdirSync(tmpFolder, { recursive: true });
        }
    );
})()