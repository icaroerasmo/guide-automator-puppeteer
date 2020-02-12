class InterpreterProxy {

    browser = null;
    page = null;

    constructor() {
        this.parseFuncs();
    }

    async proxy(methodName, args){
        let err;
        let result;
        try{
            console.log(`ARGS: ${JSON.stringify(arguments)}`);
            result = await this[methodName].apply(this, args);
        } catch(e) {
            console.log(`ERRO: ${e}`);
            err = e;
        } finally {
            let callback = args[args.length-1];
            console.log(`TIPO: ${typeof callback}`);
            if(callback && typeof callback === 'function'){
                callback(err);
            }
            return result;
        }
    }

    parseFuncs() {
        let thisPrototype = Object.getPrototypeOf(this);
        let methods = Object.getOwnPropertyNames(thisPrototype).
            filter(m => m !== 'constructor');
        console.log(`METHODS: ${JSON.stringify(methods)}`);
        for(let m of methods) {
            console.log(`SINGLE METHOD: ${m}`);
            const methodName = '_'+m;
            thisPrototype[methodName] = thisPrototype[m];
            thisPrototype[m] =
             async (...args) => {
                return await this.proxy(methodName, args)
            }
        }
        Object.setPrototypeOf(this, thisPrototype);
    }
}

module.exports = InterpreterProxy;