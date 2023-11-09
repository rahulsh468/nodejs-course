const https = require('https');

const store = Date.now();

function doRequest() {
    https.request('https://www.google.com', (res) => {
        res.on('data', () => { });
        res.on('end', () => { console.log(Date.now() - store) });
    }).end();
}

doRequest()
doRequest()
doRequest()
doRequest()
doRequest()
doRequest()