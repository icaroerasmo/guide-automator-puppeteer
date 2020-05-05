const Proxy = require('main/libs/Proxy')

class AutomatorProxy extends Proxy{

    browser = null;
    page = null;

    constructor(isDebugEnabled, isVerboseEnabled) {
        super(isDebugEnabled, isVerboseEnabled);
    }

    async proxy(methodName, args){
       return await super.proxy(methodName, args,
        (err) => {
            if(err) {
                this.browser.close();
                process.exit(-1);
            }
        })
    }
}

module.exports = AutomatorProxy;