module.exports = {
    replaceAt: (begin, end, str, replacement) => {
        return str.substr(0, begin) + replacement + str.substr(end);
    }
};