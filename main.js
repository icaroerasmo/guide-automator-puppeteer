const App = require('@main/libs/FileReader');
const u = require('@main/libs/Utils');

u.screenshot('https://jovemnerd.com.br/', '.card-custom', 'test.png', (err)=>{
    if(!err) {
        console.log('took screenshot');
    }
})

const a = new App();
a.itWorks();

u.printsName("Ícaro Erasmo Souza Barreiro");
