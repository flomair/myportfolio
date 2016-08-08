$(document).foundation();
(function () {
    'use strict';

    var myApplication = angular.module('application', [
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
            $http.get('/assets/data/main.json', { cache: false })
                .then(function (res) {
                    $scope.projects = res.data;

                    for(var d in $scope.projects.dets){
                      $scope.projects.dets[d].resps =$scope.projects.dets[d].imgs["main-img"].resps;
                      $scope.projects.dets[d].ialt =$scope.projects.dets[d].imgs["main-img"].alt;
                    console.log($scope.projects);
                    }
                });

        })

    .controller('detailsCrtl', function ($scope, $http, $stateParams) {
        $http.get('/assets/data/' + $stateParams.id + '.json', { cache: false })
            .then(function (res) {
                $scope.project = res.data;

                $http.get('/assets/data/main.json', { cache: false })
                    .then(function (res) {
                        $scope.project.second = res.data;
                        //console.log($scope.project);
                    });

            });
    });

    fetchData().then(bootstrapApplication);


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



    function fetchData() {
        var initInjector = angular.injector(["ng"]);
        var $http = initInjector.get("$http");

        return $http.get("/assets/data/config.json").then(function(response) {
            myApplication.constant("config", response.data);
        }, function(errorResponse) {
            // Handle error case
        });
    }

    function bootstrapApplication() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ["application"]);
        });
    }










})();

/*
(function () {
    'use strict';



    var toJson = function (workbook, resp) {
        var result = {},
            re, i,config;
        workbook.SheetNames.sort(function (a, b) {
          if(a === "config"){
              return -1;
          }
          if (b === "config") {
            return 1;
         }
          return 0;
        });
        workbook.SheetNames.forEach(function (sheetName) {
            var roa = XLS.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], { "header": 0 });
            if (roa.filter(function(el){return el.oname === "#datasbeginn"}).length === 0) {
                if (roa.length > 0) {
                    re = { "id": sheetName };
                    for (i = 0; i < roa.length; i++) {
                        if (roa[i].oname != "undefined") {
                            try {
                                re[roa[i].oname] = JSON.parse(roa[i].ovalue);
                            } catch (err) {
                                re[roa[i].oname] = roa[i].ovalue;
                            }
                        }
                    }
                    if(re.imgs){
                    re.imgs = setresps(re.imgs,resp);
                    }
                }
            } else {
                re = { "dets": {} };
                var detsarr = [];
                var detsarr2 = [];
                for (i = 0; i < roa.length; i++) {
                    if (roa[i].oname) {
                        if (roa[i].oname === "#datasbeginn") break;
                        try {
                            re[roa[i].oname] = JSON.parse(roa[i].ovalue);
                        } catch (err) {
                            re[roa[i].oname] = roa[i].ovalue;
                        }
                    }
                }
                for (var de in roa[i]) {
                    if (de != "oname") {
                        re.dets[roa[i][de]] = { "id": roa[i][de] };
                        detsarr.push(de);
                        detsarr2.push(roa[i][de]);
                    }
                }
                for (var j = i + 1; i < roa.length; j++) {
                    if (roa[i].oname != "undefined") {
                        if (roa[j].oname === "#datasend") break;
                        for (var d = 0; d < detsarr.length; d++) {
                            try {
                                re.dets[detsarr2[d]][roa[j].oname] = JSON.parse(roa[j][detsarr[d]]);
                            } catch (err) {
                                re.dets[detsarr2[d]][roa[j].oname] = roa[j][detsarr[d]];
                            }
                        }
                    }

                }

                for(var i in re.dets){
                    if(re.dets[i].imgs){
                        re.dets[i].imgs = setresps(re.dets[i].imgs,resp);
                    }
                }

                //re.imgs = setresps(re.imgs,resp);
            }
            if(sheetName === "config"){
                config = re;
            }
            console.log(re);
            //createFile(dest+"/"+sheetName+".json", JSON.stringify(re),function(err){});
            //fs.writeFile(dest+"/"+sheetName+".json", JSON.stringify(re),function(err){});
            result[sheetName] = re;
        });

        //createFile(dest+"/complete.json", JSON.stringify(result),function(err){});
        //fs.writeFile(dest+"/complete.json", JSON.stringify(result),function(err){});
        return result;
    }



    var url = "/assets/data/projects3.xls";
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (e) {
        var arraybuffer = oReq.response;
        var data = new Uint8Array(arraybuffer);
        var arr = new Array();
        for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");

        $.getJSON("/assets/data/resolutions.json", function (data) {
            var workbook = XLS.read(bstr, { type: "binary" });
            toJson(workbook, data);
        });
    }

    oReq.send();





    function setresps(r,re) {
        for (var i in r) {
            r[i].resps = {};
            re.forEach(function (co) {
                r[i].resps[co.width] = r[i].img + co.suffix + "." + r[i].ext;
            });
        }
        return r;
    }
})();
*/
