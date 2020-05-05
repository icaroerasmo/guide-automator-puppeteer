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
};