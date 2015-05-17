var angular = require('angular');

var app = angular.module('mainApp', []);

app.controller('MainCtrl', ['$scope', function($scope){
    $scope.test = 'World';
}]);


