const Proxy = require('../libs/Proxy')

class AutomatorProxy extends Proxy{

    browser = null;
    page = null;

    constructor(isDebugEnabled, isVerboseEnabled) {
        super(isDebugEnabled, isVerboseEnabled);
    }

    async proxy(methodName, args){

        await super.proxy(
            methodName,
            args,
            (err) => {
                if(err) {
                    this.browser.close();
                    process.exit(-1);
                }
            }
        );

       return this;
    }
}

module.exports = AutomatorProxy;