const Proxy = require('main/libs/Proxy')

class InterpreterProxy extends Proxy {
    
    instance = null;

    constructor() {
        super();
    }

    async proxy(methodName, args) {
        let output = await super.proxy(methodName, args,
        (err) => {
            this.instance.close();
            if(err){
                process.exit(-1);    
            }
            process.exit(0);
        });
        if(methodName == '_run') {
            this.instance.close();
        }

        return output;
    }
}

module.exports = InterpreterProxy;