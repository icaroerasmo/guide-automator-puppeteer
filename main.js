const App = require('@main/libs/FileReader');
const u = require('@main/libs/Utils');

var app = require("node-server-screenshot");
app.fromHTML(
    'This has been modified by injecting the HTML',
    "test.png",
    {inject: {
        url: "https://docs.npmjs.com/creating-a-package-json-file",
        selector: {className: "article-head"}
    }},
    function(){
        //an image of the HTML has been saved at ./test.png
    }
);

const a = new App();
a.itWorks();

u.printsName("Ícaro Erasmo Souza Barreiro");
