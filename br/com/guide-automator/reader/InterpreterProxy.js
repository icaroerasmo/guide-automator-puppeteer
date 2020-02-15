const Proxy = require('main/libs/Proxy')

class InterpreterProxy extends Proxy {
    
    instance = null;

    constructor() {
        super();
    }

    async proxy(methodName, args) {
        super.proxy(methodName, args,
        () => {
            this.instance.close();
        });
    }
}

module.exports = InterpreterProxy;