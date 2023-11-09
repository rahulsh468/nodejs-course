const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const store = Date.now();

function doRequest() {
    https.request('https://www.google.com', (res) => {
        res.on('data', () => { });
        res.on('end', () => { console.log(Date.now() - store) });
    }).end();
}

function doHash() {
    crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
        console.log('Hash ', Date.now() - store);
    });
}

doRequest()
// function fsCode() {
fs.readFile('multiTask.js', 'utf8', () => {
    console.log('FS: ', Date.now() - store)
})
// }

doHash()
doHash()
doHash()
doHash()