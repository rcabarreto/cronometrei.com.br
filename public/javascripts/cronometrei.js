/* ========================================================================
 * Cronometrei Webapp
 * http://www.cronometrei.com.br
 * Version: 2.0
 * ========================================================================
 * Copyright 2014-2015 R3 Web Solutions
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
        console.log('Bem vindo!');

        $('#btnFeedback > a').click(function(e){ e.preventDefault(); app.showFeedbackForm(); });
        $('#btnLogin > a').click(function(e){ e.preventDefault(); app.callFacebookLogin(); });
        $('#btnLogout > a').click(function(e){ e.preventDefault(); app.appLogout(); });
        $('#btnUserData > a').click(function(e){ e.preventDefault(); app.showUserDataScreen(); });
        $('#btnSobre > a').click(function(e){ e.preventDefault(); app.showAboutScreen(); });
        $('#btnTempos > a').click(function(e){ e.preventDefault(); app.showMyTimers(); });

        document.title = app.settings.pageTitle + app.settings.titleSep + app.settings.homeTitleFull;
        $('h1#appTitle').html(app.settings.pageTitle);
        $('#startStopLabel').html(app.settings.startButton);
        $('#startStopInstruction').html(app.settings.startInstruction);
        $('#clearLapLabel').html(app.settings.clearButton);
        $('#clearLapInstruction').html(app.settings.clearInstruction);

        $('.progress-bar').css('width', '100%').attr('aria-valuenow', 100).html('100%');
        $('#progressbar').addClass('opaque');
        $('#application').removeClass('opaque');
        $('header > nav').removeClass('opaque');
        $('#appFooter').removeClass('opaque');

        this.hookDocumentEvents();
        this.theme.setTheme();

        return true;

    },

    startStopTimer: function () {

        if(typeof this.currentTimer == 'undefined'){
            this.currentTimer = new Timer();
            console.log('New Timer object created!');
        }

        var currentTimer = this.currentTimer;

        if (currentTimer.isWorking){
            currentTimer.stop();
        } else {
            app.settings.needToConfirm = true;
            currentTimer.start();
        }

    },

    clearLapTimer: function(){

        if(typeof this.currentTimer == 'undefined')
            return false;

        if (this.currentTimer.isWorking){
            this.currentTimer.lap();
        } else {
            this.currentTimer.clear();
            console.log('Destroing timer object!');
            app.settings.needToConfirm = false;
            this.currentTimer = undefined;
            document.title = app.settings.pageTitle + app.settings.titleSep + app.settings.homeTitleFull;
        }


        // if(this.currentTimer.time !== 0){
        //     bootbox.confirm(app.settings.clearMessage, function(result) {
        //         if(result){
        //         	currentTimer.stop();
        //         }
        //     });
        // }

    },

    confirmExit: function(){
        if(app.settings.needToConfirm)
            return app.settings.exitMessage;
    },

    hookDocumentEvents: function(){
        window.onbeforeunload = app.confirmExit;
        $(document).keydown(function(event){
            if ( !$('div.bootbox').hasClass('in') ) {
                app.keyDefaults( event );
            }
        }).keyup(function(event){
            if ( !$('div.bootbox').hasClass('in') ) {
                app.keyHandler( event );
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
                app.startStopTimer();
                break;
            case 27:
                app.clearLapTimer();
                break;
            default:
                return false;
        }
    }

};


$(document).ready(function(){
    app.init();
});
