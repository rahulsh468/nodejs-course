const cluster = require('cluster');
const express = require("express");
const app = express();

app.get('/', (req, res) => {
    // we cannot get the variable freely accessed in this function Worker()
    // cus the function is not in this instace but another section of CPU
    const worker = new Worker(function () {
        this.onmessage = function () {
            // invoked when app calls postMessage
            let counter = 0;
            while (counter < 1e9) {
                counter++;
            }
            // this wil communicate the counter var to onmessage() callback
            postMessage(counter);
        }
    })

    worker.onmessage = function (message) {
        console.log(message);
        res.send('' + message.data)
    }

    worker.postMessage();
    res.send("Hello");
})

app.get('/fast', (req, res) => {
    res.send("this was fast");
})

app.listen(3000);
