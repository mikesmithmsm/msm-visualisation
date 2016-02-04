'use strict';


// Declare app level module which depends on filters, and services
angular.module('rsViz', ['rsViz.filters', 'rsViz.services', 'rsViz.directives', 'rsViz.controllers', 'ngRoute', 'ui.bootstrap']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/tabular', {templateUrl: 'partials/partial1.html', controller: 'TabularController'});
    $routeProvider.when('/tabular', {templateUrl: 'partials/partial1.html', controller: 'TabularController'});
    $routeProvider.otherwise({redirectTo: '/tabular'});
}])
  .directive('statusClass', function() {
  return function(scope, elem, attrs) {
    scope.$watch(attrs.statusClass, function(value) {
      console.log(value);
      elem.addClass("label");
      if(value == 'disabled') {
        elem.removeClass('label-success');
        elem.removeClass('label-important');
        elem.addClass('label-warning');
      } else if(value == 'inactive' || value == 'booting' || value =='warning' || value == 'stranded in booting' ) {
        elem.removeClass('label-success');
        elem.removeClass('label-important');
        elem.addClass('label-warning');
      } else {
        elem.removeClass('label-warning');
        elem.removeClass('label-important');
        elem.addClass('label-success');
     }
    });
  };
});;
