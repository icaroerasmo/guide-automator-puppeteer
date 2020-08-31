#!/usr/bin/env node
;(() => {
    const Interpreter = require('./br/com/guide-automator/reader/Interpreter');

    let mdFile = null;
    let coverPath = null;
    let isDebugEnabled = false;
    let isVerboseEnabled = false;
    let outputFolder = './';
    let outputFileName = 'output';
    let resourcesFolder = './resources';
    let tmpFolder = `${resourcesFolder}/tmp`;

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

    new Interpreter(
        mdFile,
        coverPath,
        outputFolder,
        outputFileName,
        resourcesFolder,
        tmpFolder,
        isDebugEnabled,
        isVerboseEnabled
    ).run();
})()