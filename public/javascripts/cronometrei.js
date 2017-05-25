/* ========================================================================
 * Cronometrei Webapp
 * http://www.cronometrei.com.br
 * Version: 3.0
 * ========================================================================
 * Copyright 2014-2018 R3 Web Solutions
 * ======================================================================== */

/**
 * Created by barreto on 09/01/17.
 */


var app = angular.module('cronometrei', []);

app.controller('timerController', function ($scope, $http) {

    $scope.timers = {
        isWorking: false,
        loop: '',
        currentTimer: undefined,
        startTime: 0,
        finalTime: 0,
        startLapTime: 0,
        endLapTime: 0,
        laps: []
    };

});