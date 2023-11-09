const cluster = require('cluster');
const express = require("express");
const app = express();

// is the file in mastreMode
if (cluster.isMaster) {
    // thill cause index.js to run in childMode
    cluster.fork();
} else {
    // thill act like a child and only run as server and nthg else
    function doWork(duration) {
        const start = Date.now();
        while (Date.now() - start < duration) {
        }
    }

    app.get('/', (req, res) => {
        doWork(5000)
        res.send("Hello");
    })

    app.get('/fast', (req, res) => {
        res.send("this was fast");
    })

    app.listen(3000);
}
