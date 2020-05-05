class Proxy {
    
    constructor(isDebugEnabled, isVerboseEnabled) {
        this.isDebugEnabled = isDebugEnabled || false;
        this.isVerboseEnabled = isVerboseEnabled || false;
        this.applyProxy();
    }

    async proxy(methodName, args, errorCallback){
        let err;
        let result;
        try{
            result = await this[methodName].apply(this, args);
        } catch(e) {
            console.log(`${e}`);
            err = e;
        } finally {
            let callback = args[args.length-1];
            if(!err && callback &&
                 typeof callback === 'function'){
                callback();
            } else if(err) {
                errorCallback(err);
            }
            return result;
        }
    }

    applyProxy() {
        let thisPrototype = Object.getPrototypeOf(this);
        let methods = Object.getOwnPropertyNames(thisPrototype).
            filter(m => m !== 'constructor');
        this.debug(`IDENTIFIED METHODS: ${methods.reduce(
            (buff, meth) => buff + (buff.length <= 0 ? "" : ", ") + meth)}`);
        for(let m of methods) {
            this.debug(`PROXY APPLIED TO METHOD: ${m}`);
            const methodName = `_${m}`;
            thisPrototype[methodName] = thisPrototype[m];
            thisPrototype[m] =
             async (...args) => {
                return await this.proxy(methodName, args)
            }
        }
        Object.setPrototypeOf(this, thisPrototype);
    }

    log(message) {
        if(this.isDebugEnabled || this.isVerboseEnabled) {
            console.log("INFO - "+message);
        }
    }

    debug(message) {
        if(this.isDebugEnabled) {
            console.log("DEBUG - "+message);
        }
    }
}
module.exports = Proxy;