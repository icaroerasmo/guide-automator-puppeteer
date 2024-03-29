#!/usr/bin/env node

;(() => {
    const os = require('os');
    const fs = require('fs');
    const path = require('path');
    const { removeFakeMic } = require('./br/com/guide-automator/libs/Recorder');
    const Interpreter = require('./br/com/guide-automator/reader/Interpreter');

    let mdFile = null;
    let coverPath = null;
    let isDebugEnabled = false;
    let isVerboseEnabled = false;
    let outputFolder = './';
    let outputFileName = './output';
    let resourcesFolder = `${__dirname}/resources`;

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
            case '-id':
                process.env.integrationDebug = true;
                return;
            default:
                throw new Error(`Parameter \'${key}\' wasn\'t recognized`);
        }
    };

    readParameters(process.argv);

    fs.mkdtemp(path.join(os.tmpdir(), '/'),
        async (err, tmpFolderPath) => {
            
            if (err) throw err;

            function exitHandler(options, exitCode) {
                // if (options.cleanup) fs.rmdirSync(tmpFolderPath, { recursive: true });
                // if (exitCode || exitCode === 0) console.log(exitCode);
                // if (options.exit) fs.rmdirSync(tmpFolderPath, { recursive: true });
                fs.rmdirSync(tmpFolderPath, { recursive: true });
            }

            //do something when app is closing
            process.on('exit', exitHandler.bind(null,{cleanup:true}));

            //catches ctrl+c event
            process.on('SIGINT', exitHandler.bind(null, {exit:true}));

            // catches "kill pid" (for example: nodemon restart)
            process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
            process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

            //catches uncaught exceptions
            process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

            await new Interpreter(
                mdFile,
                coverPath,
                outputFolder,
                outputFileName,
                resourcesFolder,
                tmpFolderPath,
                isDebugEnabled,
                isVerboseEnabled
            ).run();
        }
    );

})()