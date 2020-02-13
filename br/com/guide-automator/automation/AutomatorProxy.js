class AutomatorProxy {

    browser = null;
    page = null;

    constructor() {
        this.applyProxy();
    }

    async proxy(methodName, args){
        let err;
        let result;
        try{
            result = await this[methodName].apply(this, args);
        } catch(e) {
            console.log(`ERROR: ${e}`);
            err = e;
        } finally {
            let callback = args[args.length-1];
            if(callback && typeof callback === 'function'){
                callback(err);
            }
            if(err) {
                this.browser.close();
            }
            return result;
        }
    }

    applyProxy() {
        let thisPrototype = Object.getPrototypeOf(this);
        let methods = Object.getOwnPropertyNames(thisPrototype).
            filter(m => m !== 'constructor');
        console.log(`IDENTIFIED METHODS: ${JSON.stringify(methods)}`);
        for(let m of methods) {
            console.log(`PROXY APPLIED TO METHOD: ${m}`);
            const methodName = `_${m}`;
            thisPrototype[methodName] = thisPrototype[m];
            thisPrototype[m] =
             async (...args) => {
                return await this.proxy(methodName, args)
            }
        }
        Object.setPrototypeOf(this, thisPrototype);
    }
}

module.exports = AutomatorProxy;