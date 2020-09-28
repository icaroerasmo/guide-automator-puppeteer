const HORA = 3600000;
const MINUTO = 60000;
const SEGUNDO = 1000;

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
            if(time >= HORA) {
                time -= HORA;
                horas++;
            } else if(time >= MINUTO) {
                time -= MINUTO;
                minutos++;
            } else if(time >= SEGUNDO) {
                time -= SEGUNDO;
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
    }
};