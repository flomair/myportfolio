$(document).foundation();
(function () {
    'use strict';

    angular.module('application', [
            'ui.router',
            'ngAnimate',

            //foundation
            'foundation',
            'foundation.dynamicRouting',
            'foundation.dynamicRouting.animations'
        ])
        .config(config)
        .run(run)
        .controller('myCtrl', function ($scope) {

            $scope.firstname = "John";
            $scope.lastname = "dada";
        })
        .controller('allprojectsCtrl', function ($scope, $http) {
            $http.get('/assets/data/main.json', { cache: true })
                .then(function (res) {
                    console.log(res.data);
                    $scope.projects = res.data;
                });

        })

        .controller('detailsCrtl', function ($scope, $http, $stateParams) {
            $http.get('/assets/data/'+$stateParams.id+'.json', { cache: true })
                .then(function (res) {
                    $scope.project = res.data;

                $http.get('/assets/data/main.json', { cache: true })
                .then(function (res) {
                    $scope.project.second = res.data;
                    console.log($scope.project);
                });

            });
        });



    config.$inject = ['$urlRouterProvider', '$locationProvider'];

    function config($urlProvider, $locationProvider) {
        $urlProvider.otherwise('/');

        $locationProvider.html5Mode({
            enabled: false,
            requireBase: false
        });

        $locationProvider.hashPrefix('!');
    }

    function run() {
        FastClick.attach(document.body);
    }

})();

