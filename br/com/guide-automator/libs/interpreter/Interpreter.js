const InterpreterProxy = require('./InterpreterProxy');

class Interpreter extends InterpreterProxy {
    constructor() {
        super();
    }
}

module.exports = {
    instance() {
        return new Interpreter().init();
    }
}