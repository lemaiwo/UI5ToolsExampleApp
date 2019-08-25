
var express = require('express'),
httpProxy = require('http-proxy'),
proxy = new httpProxy.createProxyServer();

var routing = {
    'app': {
        target: 'http://localhost:5000' //applications
    },
    'sap': { // sap -> root icf  eg /sap/opu/odata etc
        target: 'http://10.0.80.71',
        auth:"lemaiwo:flexso01"
    }
};

var allowCrossDomain = function(req, res) {
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Credentials', 'true');
res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');

// intercept OPTIONS method
if ('OPTIONS' === req.method) {
    res.header(200);
} else {
    var dirname = req.url.replace(/^\/([^\/]*).*$/, '$1'); //get root directory name eg sdk, app, sap
    if (!routing[dirname]){
        dirname = "app";
    }
    console.log(req.method + ': ' + routing[dirname].target + req.url);
    proxy.web(req, res, routing[dirname]);
}
};

var app = express();
app.use(allowCrossDomain);

app.listen(8005);
console.log("Proxy started on http://localhost:8005");