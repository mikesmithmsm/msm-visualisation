 var httpProxy = require('http-proxy'),
    connect   = require('connect'),
	http = require('http'),
	https = require('https'),
    endpoint = {	 
	  target: {	
		host:   'us-3.rightscale.com', // or IP address
		port:   443,
		cookie: '.rightscale.com'
	  },
	  prefix: '/api'
	},
    staticDir = 'app';

var proxy = new httpProxy.RoutingProxy();

var app = connect() 
  .use(function(request, response, next) {	
    if (request.url.indexOf(endpoint.prefix) === 0) {
	  var originalHost = request.headers.host;
	  originalHost = originalHost.substring(0, originalHost.indexOf(":"));
	  
	  request.headers.host= endpoint.target.host + ':' + endpoint.target.port;
	  
	  options = {
		host: endpoint.target.host,
		port: endpoint.target.port,
		method: request.method,
		path: request.url,
		headers: request.headers		
	  }
	  
	  var creq = https.request(options, function(cres) {
	    var cookies = [];
	  	cres.headers['set-cookie'].forEach(function(cookie) {			
			cookies.push(cookie.replace('domain='+endpoint.target.cookie+';', ''));  //rewrite the cookie domain to be valid for us
		});
		cres.headers['set-cookie'] = cookies;
		response.writeHead(cres.statusCode, cres.headers);
		cres.pipe(response); // pipe client to server response
	  });
      request.pipe(creq); // pipe server to client request	
    } else next();
  })
  .use(connect.static(staticDir))
  .listen(4242);
