const App = require('@main/libs/FileReader');
const u = require('@main/libs/Utils');

var app = require("node-server-screenshot");
u.screenshot('http://www.penta-code.com', '.tr-container', 'test.png', (err)=>{
    if(!err) {
        console.log('took screenshot');
    }
})

const a = new App();
a.itWorks();

u.printsName("Ícaro Erasmo Souza Barreiro");
