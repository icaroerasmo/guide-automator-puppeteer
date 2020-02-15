const Proxy = require('main/libs/Proxy')

class AutomatorProxy extends Proxy{

    browser = null;
    page = null;

    constructor() {
        super();
    }

    async proxy(methodName, args){
       return await super.proxy(methodName, args,
        () => {
            this.browser.close();
        })
    }
}

module.exports = AutomatorProxy;