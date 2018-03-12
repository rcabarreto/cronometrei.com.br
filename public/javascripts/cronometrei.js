"use strict";
/* ========================================================================
* Cronometrei Webapp
* http://www.cronometrei.com.br
* Version: 2.0
* ========================================================================
* Copyright 2014-2015
* ======================================================================== */

var app = {

  settings: {
    debug: false,
    forceDebug: false,
    fbAppID: '387506448107274',
    apiSettings: {
      apiProtocol: 'http', // https
      apiHost: 'localhost', // arcane-lake-28395.herokuapp.com
      apiPort: ':3000',
      apiPath: 'api'
    },
    needToConfirm: false,
    pageTitle: 'Cronometrei',
    titleSep: ' - ',
    homeTitleFull: 'O tempo sob controle',
    startButton: 'Iniciar',
    pauseButton: 'Pausar',
    continueButton: 'Continuar',
    clearButton: 'Limpar',
    lapButton: 'Volta',
    startInstruction: 'Barra de Espaço',
    clearInstruction: 'Esc',
    exitMessage: 'Seu cronometro será perdido, deseja mesmo sair?',
    clearMessage: 'Deseja mesmo zerar seu cronometro?'
  },
  currentTimer: undefined,
  currentUser: undefined,
  theme: {
    backgroundImage: "london.jpg",
    appTitleColor: "#FFF",
    startStopButtonColor: "rgba(0,158,31,0.9)",
    clearButtonColor: "rgba(177,0,0,0.9)",
    setTheme: function(){
      $('body').css('background-image', 'url("images/background/'+this.backgroundImage+'")');
      $('#appTitle').css('color', this.appTitleColor);
      $('#startStop').css('background', this.startStopButtonColor);
      $('#clearLap').css('background', this.clearButtonColor);
    }
  },

  init: function(){

    $('#btnFeedback > a').click(function(e){ e.preventDefault(); app.showFeedbackForm(); });
    $('#btnLogin > a').click(function(e){ e.preventDefault(); app.callFacebookLogin(); });
    $('#btnLogout > a').click(function(e){ e.preventDefault(); app.appLogout(); });
    $('#btnUserData > a').click(function(e){ e.preventDefault(); app.showUserDataScreen(); });
    $('#btnSobre > a').click(function(e){ e.preventDefault(); app.showAboutScreen(); });
    $('#btnTempos > a').click(function(e){ e.preventDefault(); app.showMyTimers(); });
    $('#application').removeClass('opaque');
    $('header > nav').removeClass('opaque');
    $('#appFooter').removeClass('opaque');

    this.setPageTitle();
    this.hookDocumentEvents();
    this.theme.setTheme();

    return true;
  },

  setPageTitle: function () {
    document.title = this.settings.pageTitle + this.settings.titleSep + this.settings.homeTitleFull;
  },

  startStopTimer: function () {

    if(typeof this.currentTimer === 'undefined'){
      this.currentTimer = new Timer();
    }

    var currentTimer = this.currentTimer;

    if (currentTimer.isWorking){
      currentTimer.stop();
    } else {
      this.settings.needToConfirm = true;
      currentTimer.start();
    }
  },

  clearLapTimer: function(){

    var self = this;

    if(typeof this.currentTimer === 'undefined')
      return false;

    if (this.currentTimer.isWorking){
      self.currentTimer.lap();
    } else {
      self.currentTimer.clear();

      console.log('Starting time', self.currentTimer.startTime);
      console.log('Final time', self.currentTimer.finalTime);
      console.log('Number of laps', self.currentTimer.lapCount);

      console.log('Destroing timer object!');

      console.log(self.currentTimer.laps);

      console.log('Total timer:', self.currentTimer.totalTime);

      self.settings.needToConfirm = false;
      self.currentTimer = undefined;
      self.setPageTitle();
    }
  },

  confirmExit: function(){
    if(this.settings.needToConfirm)
      return this.settings.exitMessage;
  },

  hookDocumentEvents: function(){
    var self = this;
    window.onbeforeunload = self.confirmExit;
    $(document).keydown(function(event){
      if ( !$('div.bootbox').hasClass('in') ) {
        self.keyDefaults( event );
      }
    }).keyup(function(event){
      if ( !$('div.bootbox').hasClass('in') ) {
        self.keyHandler( event );
      }
    });
  },

  keyDefaults: function(event){
    switch(event.keyCode) {
      case 32:
        event.preventDefault();
        break;
      case 27:
        event.preventDefault();
        break;
      default:
        return false;
    }
  },

  keyHandler: function(event){
    switch(event.keyCode) {
      case 32:
        this.startStopTimer();
        break;
      case 27:
        this.clearLapTimer();
        break;
      default:
        return false;
    }
  }

};


$(document).ready(function(){
  app.init();
});
