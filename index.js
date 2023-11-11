process.env.UV_THREADPOOL_SIZE = 1;
const cluster = require('cluster');
const express = require("express");
const crypto = require('crypto');
const app = express();

// is the file in mastreMode
if (cluster.isMaster) {
    // thill cause index.js to run in childMode
    cluster.fork();
} else {
    // thill act like a child and only run as server and nthg else
    app.get('/', (req, res) => {
        const start = Date.now();
        crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
            console.log('1:', Date.now() - start)
            res.send("Hello");
        })
    })

    app.get('/fast', (req, res) => {
        res.send("this was fast");
    })

    app.listen(3000);
}
