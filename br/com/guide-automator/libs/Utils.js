const webshot = require('webshot');
module.exports = {
    printsName: (name) => {
        console.log(`My name is ${name}`);
    },
    screenshot(url, selector, path, callback) {    
            webshot(
                url,
                path,
                { 
                    captureSelector: selector
                },
                callback
        );
    }
};