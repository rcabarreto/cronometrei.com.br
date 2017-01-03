/* ========================================================================
 * Cronometrei Webapp
 * http://www.cronometrei.com.br
 * Version: 2.0
 * ========================================================================
 * Copyright 2014-2015 R3 Web Solutions
 * ======================================================================== */


var cronometrei = cronometrei || {


};

cronometrei.eventos = {
	adicionar: function(){ console.log('test'); }
};


var app = {
	doing: false,
	time: 0,
	timers: [],
	startTime: 0,
	finalTime: 0,
	currentTimer: 0,
	loop: false,
	progressValue: 0,
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
		startInstruction: 'Barra de Espaço',
		clearInstruction: 'Esc',
		exitMessage: 'Seu cronometro será perdido, deseja mesmo sair?',
		clearMessage: 'Deseja mesmo zerar seu cronometro?'
	},
	user: {
		isLogged: false,
        authToken: "",
		id: "",
        user_id: "",
		email: "",
		first_name: "",
		last_name: "",
		gender: "",
		link: "",
		locale: "",
		name: "",
		timezone: 0,
		updated_time: "",
		verified: false,
		themeId: 1,
		load: function(){},
		persist: function(){}
	},
	timerInfo: {
		start: "",
		end: "",
		timer: ""
	},
	theme: {
		backgroundImage: "london.jpg",
		appTitleColor: "#FFF",
		startStopButtonColor: "rgba(0,158,31,0.9)",
		clearButtonColor: "rgba(177,0,0,0.9)",
		setTheme: function(){
			$('body').css('background-image', 'url("assets/images/background/'+this.backgroundImage+'")');
			$('#appTitle').css('color', this.appTitleColor);
			$('#startStop').css('background', this.startStopButtonColor);
			$('#clear').css('background', this.clearButtonColor);
		}
	},

	init: function(){

		// start by checking if the app is in dev or prod mode
		this.checkDebugState();

		// display startup message
		this.outputMessage('Initializing app');

		// create elements
		this.createAppElements();

		// hook window and document events
		this.hookDocumentEvents();

		// clear timer
		this.resetTimer();
		this.facebookInit();

		return true;

	},

	facebookInit: function(){
        this.stepProgress(20);
        this.outputMessage('Starting facebook integration');
        window.fbAsyncInit = function() {
            FB.init({
                appId      : app.settings.fbAppID,
                cookie     : true,
                xfbml      : true,
                status 	   : true,
                version    : 'v2.2'
            });
            app.checkLoginState();
        };
	},

	checkLoginState: function(){
		this.stepProgress(20);

        app.outputMessage('Checking user login state!');

		if( this.readCookie('userObj') != null && this.readCookie('userObj')!=''){
			app.outputMessage('User Cookie found! User logged into the app!');
			app.stepProgress(10);
			app.user = JSON.parse(this.readCookie('userObj'));
			this.loadUserInformation();
		}else{
			app.outputMessage('User NOT logged into the app! Trying facebook login instead');
			FB.getLoginStatus(function(response) {
				app.stepProgress(20);
				if (response.status === 'connected') {
					app.outputMessage('User logged into your app and Facebook! Fetching information.... ');
					app.loadFacebookInfo();
				}else if(response.status === 'not_authorized'){
					app.outputMessage('User is logged into Facebook, but not your app. Loading default app.... ');
					app.user.isLogged = false;
					app.loadCronometer();
				}else{
					app.outputMessage('User is not logged into Facebook, so we\'re not sure if they are logged into this app or not. Loading default app.... ');
					app.user.isLogged = false;
					app.loadCronometer();
				}
			});
        }
	},

	checkDebugState: function(){
		var url = window.location.hostname;
		if(url === "dev.cronometrei.com.br" || app.settings.forceDebug === true)
			app.settings.debug = true;

        this.outputMessage('##########################################################\n##    Development mode detected. Going verbose mode.    ##\n########################################################## \n\n');
		return true;
	},

	appLogin: function(user){
		this.outputMessage('==> LOGING USER INTO THE APP');
		app.user.isLogged = true;
		app.createCookie('userObj', JSON.stringify(user), 30);
		return true;
	},

	appLogout: function(){

		bootbox.confirm("Deseja mesmo sair do aplicativo?", function(result) {
			if(result){
                app.outputMessage('==> APP LOGOFF <==');
                app.user.isLogged = false;
				app.eraseCookie('userObj');
				app.facebookRevoke();
				// app.callFacebookLogout();
				return true;
			}
		});

	},

	forceLogout: function () {
        app.outputMessage('==> APP LOGOFF <==');
        app.user.isLogged = false;
        app.eraseCookie('userObj');
        return true;
    },

	callFacebookLogin: function(){
		FB.login(function(response){
			app.checkLoginState();
		}, {scope: 'public_profile,email'});
	},

	callFacebookLogout: function(){
		FB.logout(function(response) {
			app.checkLoginState();
		});
	},

	facebookRevoke: function(){
		// remover o facebook_id do user object e fazer o persist
		FB.api('/me/permissions', 'delete', function(response) {
			if(response.success){ console.log("DESLOGADO!"); location.reload(); }
		});
	},

	loadFacebookInfo: function(){
		FB.api('/me', function(user){
			app.user.user_id  	  = user.id;
			app.user.email 		  = user.email;
			app.user.first_name   = user.first_name;
			app.user.last_name 	  = user.last_name;
			app.user.gender 	  = user.gender;
			app.user.link 		  = user.link;
			app.user.locale 	  = user.locale;
			app.user.name 		  = user.name;
			app.user.timezone 	  = user.timezone;
			app.user.updated_time = user.updated_time;
			app.user.verified 	  = user.verified;

            if(!app.user.isLogged)
                app.facebookLogin(app.user);

		});
	},


    facebookLogin: function (user) {

        $.ajax({
            url: app.createAPIURL() + '/user/facebooklogin',
            method: 'POST',
            contentType: 'application/json',
            headers: {
                Auth: ''
            },
            data: JSON.stringify(user),
            crossDomain: true
        }).done(function (data, textStatus, xhr) {
            app.user.id = data.id;
            app.user.themeId = data.themeId;
            app.user.authToken = xhr.getResponseHeader('Auth');
            app.outputMessage('Facebook login app call Successfull!');
        }).fail(function () {
            responseData = {
                result: 'failed',
                status: false
            };
            app.outputMessage('Facebook login app call failed!');
        }).always(function () {

            if (app.user.id !== '' && app.user.authToken !== '')
                app.appLogin(app.user);

            app.loadCronometer();

        });

    },


    loadUserInformation: function(){
        this.outputMessage('refreshing user info...');
        app.makeAPICall('/user/', 'GET', undefined, function(response){
            if(response.result == "success"){
                app.user.first_name   = response.data.first_name;
                app.user.last_name 	  = response.data.last_name;
                app.user.gender 	  = response.data.gender;
                app.user.link 		  = response.data.link;
                app.user.locale 	  = response.data.locale;
                app.user.name 		  = response.data.name;
                app.user.timezone 	  = response.data.timezone;
                app.user.updated_time = response.data.updated_time;
                app.user.verified 	  = response.data.verified;
                app.user.themeId 	  = response.data.themeId;

                if(!app.user.isLogged)
                    app.appLogin(response.id);

                app.loadCronometer();

            }else{
                app.outputMessage('Userinfo loading failed. Going to logoff the user and try again!');
                app.forceLogout();
                app.checkLoginState();
            }

        } );
        return true;
    },


    updateUserInformation: function () {
        this.outputMessage('updating user info...');
        app.makeAPICall('/user/', 'PUT', app.user, function(response){
            if(response.result == "success"){
                // app.loadCronometer();
            }else{
                app.outputMessage('Userinfo updating failed! You may have to try again!');
            }

        } );
        return true;
    },


    createAPIURL: function(){
        return app.settings.apiSettings.apiProtocol +'://'+ app.settings.apiSettings.apiHost + app.settings.apiSettings.apiPort +'/'+ app.settings.apiSettings.apiPath;
    },

    makeAPICall: function(endPoint, method, sendData, callback){

        var responseData = {};

		$.ajax({
			url: app.createAPIURL() + endPoint,
			method: method,
			headers: {
				'Auth': app.user.authToken
			},
			contentType: 'application/json',
			data: JSON.stringify(sendData),
			crossDomain: true
		}).done(function (data) {
			responseData = {
				result: 'success',
				status: true,
				data: data
			};
			app.outputMessage('API Call Successfull!');
		}).fail(function () {
			responseData = {
				result: 'failed',
				status: false
			};
			app.outputMessage('API Call Failed!');
		}).always(function () {
			callback(responseData);
		});

    },

    loadTimers: function () {
        if(app.user.isLogged){
            this.outputMessage('Loading Timers');
            app.makeAPICall('/timer/list', 'GET', undefined, function(response){
                if(response.result == "success"){
                    // success
                    $.each(response.data, function(key, value){
                        app.timers.push(value);
					})
                }
            });
        }
        app.stepProgress(10);
	},

    loadTheme: function(){
        this.stepProgress(10);

		if(app.user.isLogged){
            this.outputMessage('Loading theme for user: '+ app.user.id);

			app.makeAPICall('/theme/'+ app.user.themeId, 'GET', undefined, function(response){
				if(response.result == "success"){
					// success
					app.outputMessage('Loaded user defined background from api: '+ response.data.image_name);
					app.theme.backgroundImage = response.data.image_name;
					app.theme.appTitleColor = response.data.logo_color;
				}
				app.theme.setTheme();
			});
		}else{
            this.outputMessage('Loading theme generic');
			app.theme.setTheme();
		}
        app.stepProgress(10);
    },

	loadCronometer: function(){
        app.stepProgress(10);
		this.setPageTitle();
		this.loadTimers();
		this.loadTheme();
		this.loadCustomMenu();
		return true;
	},

	loadCustomMenu: function(){
		this.stepProgress(10);
		if(app.user.isLogged){
			$('#btnTempos').addClass('hide');
			$('#btnAccount').removeClass('hide');
			$('#btnLogin').addClass('hide');
		}else{
			$('#btnTempos').addClass('hide');
			$('#btnAccount').addClass('hide');
			$('#btnLogin').removeClass('hide');
		}
		return true;
	},

	showLoginModal: function(){
		bootbox.dialog({
			title: "Faça seu login com o Facebook",
			message: '<div class="fb-login-button" data-max-rows="1" data-size="xlarge" data-show-faces="false" data-auto-logout-link="false"></div>'
		});
		// call facebook sdk
		FB.XFBML.parse();
	},

	showAboutScreen: function(){

		bootbox.dialog({
			title:   "Sobre o Cronometrei.",
			message: '<div class="row">  ' +
					 '<div class="col-md-12"> ' +
					 '<form class="form-horizontal"> ' +
					 '<div class="form-group"> ' +
					 '<label class="col-md-4 control-label" for="name">Name</label> ' +
					 '<div class="col-md-4"> ' +
					 '<input id="name" name="name" type="text" placeholder="Your name" class="form-control input-md"> ' +
					 '<span class="help-block">Here goes your name</span> </div> ' +
					 '</div> ' +
					 '<div class="form-group"> ' +
					 '<label class="col-md-4 control-label" for="awesomeness">How awesome is this?</label> ' +
					 '<div class="col-md-4"> <div class="radio"> <label for="awesomeness-0"> ' +
					 '<input type="radio" name="awesomeness" id="awesomeness-0" value="Really awesome" checked="checked"> ' +
					 'Really awesome </label> ' +
					 '</div><div class="radioWelcome to Contability API!"> <label for="awesomeness-1"> ' +
					 '<input type="radio" name="awesomeness" id="awesomeness-1" value="Super awesome"> Super awesome </label> ' +
					 '</div> ' +
					 '</div></div>' +
					 '</form></div></div>',
			buttons: {
				success: {
					label: "Save",
					className: "btn-success",
					callback: function () {
						var name = $('#name').val();
						var answer = $("input[name='awesomeness']:checked").val();
						app.outputMessage("Hello " + name + ". You've chosen " + answer + "");
					}
				}
			}
		});
	},

	showUserDataScreen: function(){

		bootbox.dialog({
			title:   "Meus Dados.",
			message: '<div class="row">  ' +
					 '<div class="col-md-12"> ' +
					 '<form class="form-horizontal"> ' +
					 '<div class="form-group"> ' +
					 '  <label class="col-md-4 control-label" for="name">Name</label> ' +
					 '  <div class="col-md-4"> ' +
					 '    <input id="name" name="name" type="text" placeholder="Your name" class="form-control input-md" value="'+ app.user.name +'"> ' +
					 '  </div> ' +
					 '</div> ' +
					 '<div class="form-group"> ' +
					 '  <label class="col-md-4 control-label" for="name">E-mail</label> ' +
					 '  <div class="col-md-4"> ' +
					 '    <input id="email" name="email" type="email" placeholder="Your email" class="form-control input-md" value="'+ app.user.email+'"> ' +
					 '  </div> ' +
					 '</div> ' +
					 '<div class="form-group"> ' +
					 '  <label class="col-md-4 control-label" for="name">Gender</label> ' +
					 '  <div class="col-md-4"> ' +
					 '    <select name="gender" id="gender" class="form-control input-md"><option value="Male">Male</option><option value="Female">Female</option></select>' +
					 '  </div> ' +
					 '</div> ' +
					 '<div class="form-group"> ' +
					 '  <label class="col-md-4 control-label" for="name">Theme</label> ' +
					 '  <div class="col-md-4"> ' +
					 '    <select name="theme" id="theme" class="form-control input-md"><option value="1">London</option><option value="2">Borabora</option><option value="3">Bubbles</option><option value="4">Road</option></select> ' +
					 '  </div> ' +
					 '</div> ' +
					 '</form></div></div>',
			buttons: {
				success: {
					label: "Save",
					className: "btn-success",
					callback: function () {
						app.user.name = $('#name').val();
                        app.user.email = $('#email').val();
                        app.user.gender = $('#gender').val();
                        app.user.themeId = $('#theme').val();
						app.updateUserInformation();
						app.loadTheme();
					}
				}
			}
		});

	},

	showMyTimers: function(){

		bootbox.dialog({
			title:   "Faça seu login no Cronometrei.",
			message: '<div class="row">  ' +
					 '<div class="col-md-12"> ' +
					 '<form class="form-horizontal"> ' +
					 '<div class="form-group"> ' +
					 '<label class="col-md-4 control-label" for="name">Name</label> ' +
					 '<div class="col-md-4"> ' +
					 '<input id="name" name="name" type="text" placeholder="Your name" class="form-control input-md"> ' +
					 '<span class="help-block">Here goes your name</span> </div> ' +
					 '</div> ' +
					 '<div class="form-group"> ' +
					 '<label class="col-md-4 control-label" for="awesomeness">How awesome is this?</label> ' +
					 '<div class="col-md-4"> <div class="radio"> <label for="awesomeness-0"> ' +
					 '<input type="radio" name="awesomeness" id="awesomeness-0" value="Really awesome" checked="checked"> ' +
					 'Really awesome </label> ' +
					 '</div><div class="radio"> <label for="awesomeness-1"> ' +
					 '<input type="radio" name="awesomeness" id="awesomeness-1" value="Super awesome"> Super awesome </label> ' +
					 '</div> ' +
					 '</div></div>' +
					 '</form></div></div>',
			buttons: {
				success: {
					label: "Save",
					className: "btn-success",
					callback: function () {
						var name = $('#name').val();
						var answer = $("input[name='awesomeness']:checked").val();
						app.outputMessage("Hello " + name + ". You've chosen " + answer + "");
					}
				}
			}
		});
	},

	showFeedbackForm: function(){

		bootbox.dialog({
			title:   "O que você acha do Cronometrei?",
			message: '<div class="row">  ' +
					 '<div class="col-md-12"> ' +
					 '<form class="form-horizontal"> ' +
					 '<div class="form-group"> ' +
					 '<label class="col-md-4 control-label" for="name">Seu nome</label> ' +
					 '<div class="col-md-6"> ' +
					 '<input id="name" name="name" type="text" placeholder="Your name" class="form-control input-md" value="'+app.user.name+'"> ' +
					 '</div> ' +
					 '</div> ' +
					 '<div class="form-group"> ' +
					 '<label class="col-md-4 control-label" for="awesomeness">O que você acha do Cronometrei?</label> ' +
					 '<div class="col-md-6"> ' +
					 '<div class="radio"> <label for="awesomeness-0"> ' +
					 '<input type="radio" name="awesomeness" id="awesomeness-0" value="Demais" checked="checked"> Demais! </label></div>' +
					 '<div class="radio"> <label for="awesomeness-1"> ' +
					 '<input type="radio" name="awesomeness" id="awesomeness-1" value="Legal"> Legal </label> </div> ' +
					 '<div class="radio"> <label for="awesomeness-2"> ' +
					 '<input type="radio" name="awesomeness" id="awesomeness-2" value="Mais ou menos"> Mais ou menos </label> </div> ' +
					 '<div class="radio"> <label for="awesomeness-3"> ' +
					 '<input type="radio" name="awesomeness" id="awesomeness-3" value="Fraco"> Fraco </label> </div> ' +
					 '<div class="radio"> <label for="awesomeness-4"> ' +
					 '<input type="radio" name="awesomeness" id="awesomeness-4" value="Péssimo"> Péssimo </label> </div> ' +
					 '</div></div>' +
					 '<div class="form-group"> ' +
					 '<label class="col-md-4 control-label" for="name">Mensagem</label> ' +
					 '<div class="col-md-6"> ' +
					 '<textarea id="message" name="message" class="form-control input-md"></textarea>' +
					 '</div> ' +
					 '</div> ' +
					 '</form></div></div>',
			buttons: {
				success: {
					label: "Enviar",
					className: "btn-success",
					callback: function () {

						var feedback = {
							name: $('#name').val(),
							answer: $("input[name='awesomeness']:checked").val(),
							message: $('#message').val()
						};
						// app.feedback.name = $('#name').val();
						// app.feedback.answer = $("input[name='awesomeness']:checked").val();
						// app.feedback.message = $('#message').val();

                        $.ajax({
                            url: app.createAPIURL() + "/feedback",
                            method: "POST",
                            contentType: 'application/json',
                            data: JSON.stringify(feedback),
                            crossDomain: true
                        }).done(function (data) {
                        }).fail(function () {
                        }).always(function () {
                        });

					}
				}
			}
		});

	},

	createAppElements: function(){
		$('#application').append('<div id="titleRow" class="row"></div>').append('<div id="controlRow" class="row"></div>');
		$('#titleRow').append('<h1 id="appTitle"></h1><div id="timer" class="col-md-8 col-md-offset-2"></div>');
		$('#controlRow').append('<div id="startStop" class="button col-md-2 col-md-offset-3" onclick="app.startStopTimer();"><div id="startStopLabel"></div><div id="startStopInstruction" class="instructions"></div></div>').append('<div id="clear" class="button col-md-2 col-md-offset-2" onclick="app.clearTimer();"><div id="clearLabel"></div><div id="clearInstruction" class="instructions"></div></div>');

		this.stepProgress(10);

        $('#btnFeedback > a').click(function(e){ e.preventDefault(); app.showFeedbackForm(); });
        $('#btnLogin > a').click(function(e){ e.preventDefault(); app.callFacebookLogin(); });
        $('#btnLogout > a').click(function(e){ e.preventDefault(); app.appLogout(); });
        $('#btnUserData > a').click(function(e){ e.preventDefault(); app.showUserDataScreen(); });
        $('#btnSobre > a').click(function(e){ e.preventDefault(); app.showAboutScreen(); });
        $('#btnTempos > a').click(function(e){ e.preventDefault(); app.showMyTimers(); });
        this.stepProgress(10);
	},

	setPageTitle: function(){
		this.stepProgress(10);
		document.title = app.settings.pageTitle + app.settings.titleSep + app.settings.homeTitleFull;
		$('h1#appTitle').html(app.settings.pageTitle);
		$('#startStopLabel').html(app.settings.startButton);
		$('#startStopInstruction').html(app.settings.startInstruction);
		$('#clearLabel').html(app.settings.clearButton);
		$('#clearInstruction').html(app.settings.clearInstruction);
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
				app.clearTimer();
				break;
			default:
				return false;
		}
	},

	confirmExit: function(){
		if(app.settings.needToConfirm)
			return app.settings.exitMessage;
	},

	stepProgress: function(step){
		this.progressValue+=step;
		app.loadingProgress(this.progressValue);
	},

	loadingProgress: function(progress) {
		if(progress < 100){
			$('.progress-bar').css('width', progress+'%').attr('aria-valuenow', progress).html(progress+'%');
		}else{
			$('.progress-bar').css('width', '100%').attr('aria-valuenow', 100).html('100%');
			$('#progressbar').addClass('opaque');
			$('#application').removeClass('opaque');
			$('header > nav').removeClass('opaque');
			$('#appFooter').removeClass('opaque');
		}
	},

	outputMessage: function(message){
		if(app.settings.debug)
			console.log(message);
	},

	startStopTimer: function() {
		// this.outputMessage('Call start/stop timer');
		if (app.doing)
			app.pauseTimer();
		else
			app.startTimer(app.currentTimer);
		return false;
	},

	startTimer: function(currentTimer) {
		this.outputMessage('Starting timer');
		app.settings.needToConfirm = true;
		app.doing = 1;
		
		// defino o startTime
		if(app.startTime===0)
			app.startTime = new Date();

		if(typeof(app.currentTimer) == 'undefined'){
			app.time = new Date();
		}else{
			app.time = (new Date() - app.currentTimer);
		}
		app.loop = window.setInterval("app.update()", 10);
		$('#startStopLabel').html(app.settings.pauseButton);
	},

	stopTimer: function() {
		this.outputMessage('Stopping timer');

		if(app.finalTime===0)
			app.finalTime = new Date();

		app.timerInfo.start 	= app.format_date(app.startTime);
		app.timerInfo.end 		= app.format_date(app.finalTime);
		app.timerInfo.timer 	= app.format_seconds(app.currentTimer);

		if(app.user.isLogged){
            var apiReturn = app.makeAPICall('/timer/create', 'POST', app.timerInfo, function(response){
                if(response.result == "success"){
                    // success
                    app.timers.push(response.data);
                }else{
                    // failed
                }
            } );
		}

		app.doing = 0;
		clearInterval(app.loop);
		$('#startStopLabel').html(app.settings.startButton);
	},

	pauseTimer: function(){
		this.outputMessage('Pausing timer');
		app.doing = 0;
		clearInterval(app.loop);
		app.currentTimer = app.getTime();
		app.output(app.format_seconds(app.currentTimer));
		$('#startStopLabel').html(app.settings.continueButton);
	},

	clearTimer: function(){
		if(app.time !== 0){
			this.outputMessage('Clear timer');
			bootbox.confirm(app.settings.clearMessage, function(result) {
				if(result){
					app.stopTimer();
					app.resetTimer();
				}
			});
		}
	},

	resetTimer: function(){
		app.settings.needToConfirm = false;
		app.time = 0;
		app.startTime = 0;
		app.finalTime = 0;
		app.currentTimer = 0;
		app.output(app.format_seconds(0));
	},

	update: function(){
		app.output(app.format_seconds(app.getTime()));
	},

	output: function(output){
		$('#timer').text(output);
	},

	getTime: function(){
		return (new Date() - app.time);
	},

	pad2: function(number) {
		return (number < 10 ? '0' : '') + number
	},

	format_date: function(dateVar){

		var dt = new Date(dateVar);
		var dtstring = dt.getFullYear()
		    + '-' + app.pad2(dt.getMonth()+1)
		    + '-' + app.pad2(dt.getDate())
		    + ' ' + app.pad2(dt.getHours())
		    + ':' + app.pad2(dt.getMinutes())
		    + ':' + app.pad2(dt.getSeconds());

		return dtstring;

	},

	format_seconds: function(seconds){
		if(isNaN(seconds))
			seconds = 0;
		var diff = new Date(seconds);
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
		document.title = hours + ":" + minutes + ":" + seconds + app.settings.titleSep + app.settings.pageTitle;
		return hours + ":" + minutes + ":" + seconds + ":" + milliseconds;
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
        this.stepProgress(10);
	},

	createCookie: function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	},

	readCookie: function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	},

	eraseCookie: function(name) {
		this.createCookie(name,"",-1);
	}

};


// START THE APP
$(document).ready(function(){
	app.init();
});