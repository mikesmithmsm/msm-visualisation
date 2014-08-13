'use strict';

angular.module('rsViz.controllers', [])
  .controller('TabularController', ['$scope', 'RightScale', 'RightScaleDeployment', 'RightScaleInstances','$filter', '$modal', function($scope, RightScale, RightScaleDeployment, RightScaleInstances, $filter, $modal) {

    var $jq = jQuery.noConflict();

    $scope.myData = {
      currentDeployment: {},
      deploymentList: []
    };

    $scope.init = function() {
      RightScale.ping({}, function(data) {
         $scope.listDeployments();
      },
      function(response) {
         $scope.login();
      });
    }

    $scope.login = function() {
      var modalInstance = $modal.open({
        templateUrl: 'login.html',
        controller: 'LoginController'
      });

      modalInstance.result.then(function (user) {
        RightScale.login(user, {}, function(data) {
          $scope.listDeployments();
        },
        function(data) {
          $scope.login();
        });
      });
   };

    $scope.listDeployments = function() {
      RightScale.deployments({}, function(data) {
        $scope.myData.deploymentList = data;
      });
    };

    $scope.setCurrentDeployment = function(name) {
      $scope.myData.currentDeployment.deployment = $scope.findDeployment(name);
      var deploymentId = $scope.findObjectId($scope.myData.currentDeployment.deployment, 'self');
      $scope.myData.currentDeployment.instances = [];

      RightScaleDeployment.servers({deployment: deploymentId}, function(data) {
        $scope.myData.currentDeployment.servers = data;
        RightScaleInstances.forServers(data, $scope.myData.currentDeployment.instances);
      });

      RightScaleDeployment.serverArrays({deployment: deploymentId}, function(data) {
        $scope.myData.currentDeployment.server_arrays = data;
         RightScaleInstances.forServerArrays(data, $scope.myData.currentDeployment.instances);
      });
    }

    $scope.findObjectId = function(object, linkRel) {
      var rel = $filter('filter')(object.links, function (link) {return  link.rel === linkRel;})[0];
      return /[^/]*$/.exec(rel['href'])[0];
    }

    $scope.findDeployment = function(name) {
      return $filter('filter')($scope.myData.deploymentList, function (deployment) {return deployment.name === name;})[0];
    }

    $scope.showAll = function() {
      $scope.myData.currentDeployment = {};
    };

    $scope.init();
  }])

  .controller('LoginController', ['$scope','$modalInstance', function($scope, $modalInstance) {
    $scope.user = { email: '', password: '' };

    $scope.submit = function () {
      $modalInstance.close($scope.user);
    }
  }]);