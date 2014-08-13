'use strict';

angular.module('rsViz.services', ['ngResource'])
  .factory('RightScale', function($resource){
    return $resource('https://us-3.rightscale.com/api/:path',
      {path:    '@path' }, {
        login:   {
          method: 'POST',
          params: {path: 'session', account_href: '/api/accounts/70082', email: '@email', password: '@password', api_version: 1.5},
          isArray: false
        },
        deployments:   {
          method: 'GET',
          params:  {path: 'deployments.json'},
          headers: {'X_API_VERSION': '1.5' },
          isArray: true
        },
        ping:   {
          method: 'GET',
          params:  {path: 'deployments.json'},
          headers: {'X_API_VERSION': '1.5' },
          isArray: true
        }
      }
    )
  })
  .factory('RightScaleDeployment', function($resource){
    return $resource('https://us-3.rightscale.com/api/deployments/:deployment/:asset.json',
      {deployment:    '@deployment', asset:    '@asset' }, {
        servers:  {
          method: 'GET',
          params:  {asset: 'servers', deployment: ''},
          headers: {'X_API_VERSION': '1.5' },
          isArray: true
        },
        serverArrays:  {
          method: 'GET',
          params:  {asset: 'server_arrays', deployment: ''},
          headers: {'X_API_VERSION': '1.5' },
          isArray: true
        }
      }
    )
  })
  .factory('RightScaleServer', function($resource){
    return $resource('https://us-3.rightscale.com/api/clouds/2/instances/:server.json',
      {server:    '@server'}, {
        server:  {
          method: 'GET',
          params:  {server: ''},
          headers: {'X_API_VERSION': '1.5' },
          isArray: false
        }
      }
    )
  })
  .factory('RightScaleServerArray', function($resource){
    return $resource('https://us-3.rightscale.com/api/server_arrays/:server/current_instances.json',
      {server:    '@server'}, {
        server:  {
          method: 'GET',
          params:  {server: ''},
          headers: {'X_API_VERSION': '1.5' },
          isArray: true
        }
      }
    )
  })
  .service('RightScaleInstances', function($resource, $filter, RightScaleServerArray, RightScaleServer) {

    var _self = this;

    this.forServers = function(servers, instances) {
      if (servers) {
        servers.forEach(function(server) {
          var serverId = _self.findObjectId(server, 'current_instance');
          RightScaleServer.server({server: serverId}, function(data) {
            instances.push({
                name: data.name,
                public_ip: data.public_ip_addresses[0],
                private_ip: data.private_ip_addresses[0],
                state: data.state,
                server_array: ''
            });
          })
        });
      }
    }

    this.forServerArrays = function(server_arrays, instances) {
      if (server_arrays) {
        server_arrays.forEach(function(server_array) {
          var serverArrayId = _self.findServerArrayInstance(server_array);
          RightScaleServerArray.server({server: serverArrayId}, function(data) {
            data.forEach(function(server_array_instance) {
              instances.push({
                  name: server_array_instance.name,
                  public_ip: server_array_instance.public_ip_addresses[0],
                  private_ip: server_array_instance.private_ip_addresses[0],
                  state: server_array_instance.state,
                  server_array: server_array.name
              });
            });
          })
        });
      }
    }

    this.findServerArrayInstance = function(servers) {
      var link = $filter('filter')(servers.links, function (server) {return server.rel === 'current_instances';})[0];
      return link.href.split('/')[3]
    }

    this.findObjectId = function(object, linkRel) {
      var rel = $filter('filter')(object.links, function (link) {return  link.rel === linkRel;})[0];
      return /[^/]*$/.exec(rel['href'])[0];
    };

  })
  .value('version', '0.1');