module.exports = {
    replaceAt: (begin, end, str, replacement) => {
        return str.substr(0, begin) + replacement + str.substr(end);
    },
    splitCodeIntoLines(code) {
        return code.split('\n').filter(w => w !== '' && w !== ' ');
    },
    splitCommandLine: (line) => {
        return line.split(/('.*?'|".*?"|\S+)/g).
            filter(w => w != null && w !== '' && w !== ' ').
            map(w => w.replace(/"/g, "").replace(/"/g, ""));
    },
};