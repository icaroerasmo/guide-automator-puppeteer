const Proxy = require('../libs/Proxy')

class InterpreterProxy extends Proxy {
    
    instance = null;

    constructor(isDebugEnabled, isVerboseEnabled) {
        super(isDebugEnabled, isVerboseEnabled);
    }

    async proxy(methodName, args) {
        let output = await super.proxy(methodName, args,
        (err) => {
            if(this.instance){
                this.instance.close();
            }
            if(err){
                process.exit(-1);    
            }
            process.exit(0);
        });
        if(this.instance && methodName == '_run') {
            this.instance.close();
        }

        return output;
    }
}

module.exports = InterpreterProxy;