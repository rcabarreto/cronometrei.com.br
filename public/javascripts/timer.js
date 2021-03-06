"use strict";

var Timer = function () {

  this.isWorking = false;
  this.loop = '';
  this.currentTimer = undefined;
  this.startTime = 0;
  this.finalTime = 0;
  this.startLapTime = 0;
  this.lapCount = 0;
  this.totalTime = '';
  this.laps = [];

  this.controlTimer = 0;

  this.start = function () {

    this.isWorking = true;

    if (this.controlTimer === 0) {
      this.controlTimer = new Date().getTime();
      this.startTime = this.controlTimer;
      this.startLapTime = this.controlTimer;
    } else {
      this.startLapTime = new Date().getTime();
    }

    // unpause test
    if(typeof(this.currentTimer) == 'undefined'){
      this.controlTimer = new Date().getTime();
      this.startLapTime = this.controlTimer;
    }else{
      this.controlTimer = (new Date().getTime() - this.currentTotalTimer);
      this.startLapTime = (new Date().getTime() - this.currentTimer);
    }

    this.loop = window.setInterval("app.currentTimer.update()", 10);

    $('#startStopLabel').html(app.settings.pauseButton);
    $('#clearLapLabel').html(app.settings.lapButton);

  };


  this.stop = function () {
    if(this.isWorking){

      this.isWorking = false;

      clearInterval(this.loop);

      this.currentTimer = this.getTime();
      this.currentTotalTimer = this.getTotalTime();

      this.output(this.getTime(), this.getTotalTime());

      $('#startStopLabel').html(app.settings.continueButton);
      $('#clearLapLabel').html(app.settings.clearButton);

      this.finalTime = new Date().getTime();

    }
  };

  this.clear = function () {

    this.createLap(this.currentTimer);

    this.controlTimer = new Date().getTime();
    this.startLapTime = this.controlTimer;

    this.output(this.getTime(), this.getTotalTime());

    $('#totaltimer').addClass('hideTotalTimer');
    $('#startStopLabel').html(app.settings.startButton);

    this.startTime = this.format_date(this.startTime, 'full');
    this.finalTime = this.format_date(this.finalTime, 'full');
    this.totalTime = this.format_seconds(this.currentTotalTimer, 'full');

  };

  this.lap = function () {
    $('#totaltimer').removeClass('hideTotalTimer');
    this.createLap(this.getTime());
    this.startLapTime = new Date().getTime();
  };

  this.createLap = function (lapTimer) {
    var currentLap = {
      lapNumber: this.lapCount++,
      lapTime: this.format_seconds(lapTimer, 'full')
    };
    this.laps.push(currentLap);
  };

  this.update = function(){
    this.output(this.getTime(), this.getTotalTime());
  };

  this.output = function(lapTime, totalTime){
    lapTime = this.format_seconds(lapTime, 'full');
    totalTime = this.format_seconds(totalTime, 'total');
    $('#maintimer').text(lapTime);
    $('#totaltimer').text(totalTime);
  };

  this.getTime = function(){
    return (new Date().getTime() - this.startLapTime);
  };

  this.getTotalTime = function () {
    return (new Date().getTime() - this.controlTimer);
  };

  this.pad2 = function(number) {
    return (number < 10 ? '0' : '') + number
  };

  this.format_date = function(dateVar){
    var dt = new Date(dateVar);
    var dtstring = dt.getFullYear()
        + '-' + this.pad2(dt.getMonth()+1)
        + '-' + this.pad2(dt.getDate())
        + ' ' + this.pad2(dt.getHours())
        + ':' + this.pad2(dt.getMinutes())
        + ':' + this.pad2(dt.getSeconds());
    return dtstring;
  };

  this.format_seconds = function(second, output){
    if(isNaN(second))
      second = 0;
    var diff = new Date(second);
    var hours = diff.getUTCHours();
    var minutes = diff.getMinutes();
    var seconds = diff.getSeconds();
    var milliseconds = diff.getMilliseconds();
    if (hours < 10)
      hours = "0" + hours;
    if (minutes < 10)
      minutes = "0" + minutes;
    if (seconds < 10)
      seconds = "0" + seconds;
    if (milliseconds < 10)
      milliseconds = "00" + milliseconds;
    else if (milliseconds < 100)
      milliseconds = "0" + milliseconds;

    if (output === 'full'){
      document.title = hours + ":" + minutes + ":" + seconds + app.settings.titleSep + app.settings.pageTitle;
      return hours + ":" + minutes + ":" + seconds + ":" + milliseconds;
    } else {
      return hours + ":" + minutes + ":" + seconds;
    }

  };

  return this;
};
