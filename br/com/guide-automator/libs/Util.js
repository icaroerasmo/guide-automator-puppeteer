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
      let millisseconds = Number(splt1[1])*10;

      return hours + minutes + seconds + millisseconds;
    },
    sleep(millis) {
        return new Promise((resolve) => {setTimeout(resolve, millis);});
    },
    randomNum(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min
    }
};