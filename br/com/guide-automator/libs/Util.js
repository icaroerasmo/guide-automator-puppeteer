const HOUR = 3600000;
const MINUTE = 60000;
const SECOND = 1000;

module.exports = {
    replaceAt: (begin, end, str, replacement) => {
        return str.substr(0, begin) + replacement + str.substr(end);
    },
    splitCodeIntoLines: (code) => {
        return code.split('\n').filter(w => !w.match(/^\s*$/g));
    },
    splitCommandLine: (line) => {
        return line.split(/('.*?'|".*?"|\S+)/g).
            filter(w => w != null && !w.match(/^\s*$/g)).
            map(w => w.replace(/"/g, "").replace(/'/g, ""));
    },
    leadingZeros(num, numberOfZeros) {
        let zeros = "0".repeat(numberOfZeros - 1);
        return (zeros + num).slice(-1*numberOfZeros);
    },
    twoDigits(num){
        return this.leadingZeros(num, 2);
    },
    threeDigits(num){
        return this.leadingZeros(num, 3);
    },
    formattedTime(time) {

        let horas = 0;
        let minutos = 0;
        let segundos = 0;
        let mili = 0;

        while(time > 0) {
            if(time >= HOUR) {
                time -= HOUR;
                horas++;
            } else if(time >= MINUTE) {
                time -= MINUTE;
                minutos++;
            } else if(time >= SECOND) {
                time -= SECOND;
                segundos++;
            } else {
                mili = time;
                time = 0;
            }
        }

        return `${this.twoDigits(horas)}:${this.twoDigits(minutos)}:${this.twoDigits(segundos)},${this.threeDigits(mili)}`;
    },
    unformattedTime(time) {
      let splt1 = time.split(".")
      let splt2 = splt1[0].split(":");

      let hours = Number(splt2[0]) * HOUR;
      let minutes = Number(splt2[1]) * MINUTE;
      let seconds = Number(splt2[2]) * SECOND;

      let multiplyFactor;

      if(splt1[1].length == 1) {
          multiplyFactor = 100;
      } else if(splt1[1].length == 2) {
          multiplyFactor = 10;
      } else {
          multiplyFactor = 1;
      }

      let millisseconds = Number(splt1[1]) * multiplyFactor;

      return hours + minutes + seconds + millisseconds;
    },
    sleep(millis) {
        return new Promise((resolve) => {setTimeout(resolve, millis);});
    },
    randomNum(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min
    },
    async externalCall({exec, params, onError, onClose, onStdout}) {
        
        let resolve, reject;

        if(!exec || !params) {
            reject(new Error('Async template is missing mandatory parameters. Check if exec or params are null.'));
        }

        const deffered = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
        
        let spawn = require('child_process').spawn;

        let proc = spawn(exec, params);

        proc.on('close', async (data) => {
            if (onClose){
                await onClose(data);
            }
            resolve();
        });

        
        proc.stdout.on('data', async (data) => {
            if(process.env.integrationDebug){
                console.log(data.toString());
            }
            if(onStdout) {
                await onStdout(data);
            }
        });

        proc.stderr.on('data', async (data) => {
            if(process.env.integrationDebug){
                console.log(data.toString());
            } 
            if(onError){
                await onError(data);
            }
        });

        return deffered;
    }
};