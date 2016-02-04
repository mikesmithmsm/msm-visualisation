 var httpProxy = require('http-proxy'),
     connect   = require('connect'),
     serveStatic = require('serve-static')
	   http = require('http'),
	   https = require('https'),
     requestify = require('requestify')

endpoint = {
  target: {
	host:   'us-3.rightscale.com', // or IP address
	port:   443,
	cookie: '.rightscale.com'
  },
  prefix: '/api'
},
staticDir = 'app';
environments = process.env.ENVIRONMENT_LIST.split(',');

var accessToken;
var proxy = new httpProxy.RoutingProxy();

var app = connect()
  .use(function(request, response, next) {
    if (! accessToken) {
      requestify.post('https://us-3.rightscale.com/api/oauth2', {
          grant_type: 'refresh_token',
          refresh_token: process.env.REFRESH_TOKEN
      }, {headers: {X_API_VERSION: '1.5'}})
      .then(function(response) {
          accessToken = JSON.parse(response.body).access_token;
          setTimeout(function() {
            accessToken = undefined
          }, 1000*60*1)
          next();
      });
    } else {
      next();
    }
  })
  .use(function(request, response, next) {
    if (request.url.indexOf(endpoint.prefix) === 0) {
  	  request.headers.host= endpoint.target.host + ':' + endpoint.target.port;
      request.headers.Authorization = 'Bearer '+accessToken

  	  options = {
    		host: endpoint.target.host,
    		port: endpoint.target.port,
    		method: request.method,
    		path: request.url,
    		headers: request.headers
  	  }

  	  var creq = https.request(options, function(cres) {
    		response.writeHead(cres.statusCode, cres.headers);
    		cres.pipe(response); // pipe client to server response
  	  });
      request.pipe(creq); // pipe server to client request
    } else {
      next();
    }
  })
  .use('/environments', function(request, response, next) {
    response.setHeader('Content-Type', 'application/json');
    response.writeHead(200);
    response.write(JSON.stringify({'environments': environments}));
    response.end();
  })
  .use(serveStatic('app'))
  .listen(4242);
