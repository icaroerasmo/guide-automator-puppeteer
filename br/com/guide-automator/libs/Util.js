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
    twoDigits(num){
        return ("0" + num).slice(-2);
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

        return `${this.twoDigits(horas)}:${this.twoDigits(minutos)}:${this.twoDigits(segundos)},${this.twoDigits(mili)}`;
    },
    sleep(millis) {
        return new Promise((resolve) => {setTimeout(resolve, millis);});
    },
    randomNum(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min
    }
};