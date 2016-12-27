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
	adicionar: function(){ console.log('test'); },
};


var app = {
	doing: false,
	time: 0,
	startTime: 0,
	finalTime: 0,
	currentTimer: 0,
	loop: false,
	progressValue: 0,
	settings: {
		debug: false,
		forceDebug: true,
		fbAppID: '387506448107274',
        apiHome: "http://api.cronometrei.com.br:3000/api",
		apiSettings: {
			apiProtocol: 'http',
			apiHost: 'api.cronometrei.com.br',
			apiPort: '3000',
			apiPath: 'api',
		},
		needToConfirm: false,
		pageTitle: 'Cronometrei',
		titleSep: ' - ',
		homeTitleFull: 'O tempo sob controle',
		defaultBG: 'london.jpg',
		startButton: 'Iniciar',
		pauseButton: 'Pausar',
		continueButton: 'Continuar',
		clearButton: 'Limpar',
		startInstruction: 'Barra de Espaço',
		clearInstruction: 'Esc',
		exitMessage: 'Seu cronometro será perdido, deseja mesmo sair?',
		clearMessage: 'Deseja mesmo zerar seu cronometro?',
	},
	user: {
		logged: false,
		id: "",
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
		load: function(){},
		persist: function(){},
	},
	timerInfo: {
		user_id: "",
		start: "",
		end: "",
		timer: "",
	},
	feedback: {
		name: '',
		answer: '',
		message: '',
	},
	theme: {
		backgroundImage: "",
		appTitleColor: "#FFF",
		startStopButtonColor: "rgba(0,158,31,0.9)",
		clearButtonColor: "rgba(177,0,0,0.9)",
		setTheme: function(){
			$('body').css('background-image', 'url("assets/images/background/'+this.backgroundImage+'")');
			$('#appTitle').css('color', this.appTitleColor);
			$('#startStop').css('background', this.startStopButtonColor);
			$('#clear').css('background', this.clearButtonColor);
		},
	},

	init: function(){

		// start by checking if the app is in dev or prod mode
		this.checkDebugState();

		// display startup message
		this.outputMessage('Initializing app');

		// create elements
		this.createAppElements();
		this.createButtonLinks();

		// hook window and document events
		this.hookDocumentEvents();

		// clear timer
		this.resetTimer();

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

		return true;
	},

	checkLoginState: function(){
		this.stepProgress(10);

		// check app cookie
		// se estiver setado o cookie de usuario do app, pegar o id, jogar no objeto user
		// e mandar para o metodo pra carregar os dados do banco.

		// se não estiver setado o cookie do app, carregar integração com facebook 
		// e testar se o usuário está logado com facebook. Se estiver, criar cookie do app
		if( this.readCookie('appUserId') != null && this.readCookie('appUserId')!=''){
			app.outputMessage('User logged into the app!');
			app.stepProgress(10);
			app.user.logged = true;
			app.user.id  = this.readCookie('appUserId');
			this.loadUserInformation();
		}else{
			app.outputMessage('User NOT logged into the app! Trying facebook loggin instead');
			FB.getLoginStatus(function(response) {
				app.stepProgress(10);
				if (response.status === 'connected') {
					app.outputMessage('User logged into your app and Facebook! Fetching information.... ');
					app.loadFacebookInfo();
				}else if(response.status === 'not_authorized'){
					app.outputMessage('User is logged into Facebook, but not your app. Loading default app.... ');
					app.user.logged = false;
					app.stepProgress(10);
					app.loadCronometer();
				}else{
					app.outputMessage('User is not logged into Facebook, so we\'re not sure if they are logged into this app or not. Loading default app.... ');
					app.user.logged = false;
					app.stepProgress(10);
					app.loadCronometer();
				}
			});
        }
	},

	checkDebugState: function(){
		var url = window.location.pathname;
		var filename = url.substring(url.lastIndexOf('/')+1);
		if(filename === "dev.php" || app.settings.forceDebug === true){
			console.log('##########################################################\n##    Development mode detected. Going verbose mode.    ##\n########################################################## \n\n');
			app.settings.debug = true;
		}
		return true;
	},

	appLogin: function(userid){
		this.outputMessage('==> LOGING USER INTO THE APP');
		app.user.logged = true;
		app.createCookie('appUserId', userid, 30);
		return true;
	},

	appLogout: function(){

		bootbox.confirm("Deseja mesmo sair do aplicativo?", function(result) {
			if(result){
				app.outputMessage('==> LOGGIN USER OUT OF THE APP');
				app.eraseCookie('appUserId');
				app.facebookRevoke();
				// app.facebookLogout();
				return true;
			}
		});

	},

	facebookLogin: function(){
		FB.login(function(response){
			app.checkLoginState();
		}, {scope: 'public_profile,email'});
	},

	facebookLogout: function(){
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
			app.user.id  		  = user.id;
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

            if(!app.user.logged)
                app.appLogin(user.id);

            app.loadCronometer();
            app.stepProgress(10);

		});
	},

	loadUserInformation: function(){
		this.outputMessage('loading user info...');
		$.ajax({
			url: app.createAPIURL() + "/user/loaduserinfo",
			method: "GET",
			data: {},
			crossDomain: true
		}).done(function(data) {
			var response = JSON.parse(data);
			app.user.id 		  = response.data.id;
			app.user.email 		  = response.data.email;
			app.user.first_name   = response.data.first_name;
			app.user.last_name 	  = response.data.last_name;
			app.user.gender 	  = response.data.gender;
			app.user.link 		  = response.data.link;
			app.user.locale 	  = response.data.locale;
			app.user.name 		  = response.data.name;
			app.user.timezone 	  = response.data.timezone;
			app.user.updated_time = response.data.updated_time;
			app.user.verified 	  = response.data.verified;
			app.outputMessage('user info loaded');
		}).fail(function() {
			app.outputMessage('Userinfo loading failed, going on with default user info...');
		}).always(function(){
            if(!app.user.logged)
                app.appLogin(response.id);
            app.loadCronometer();
			app.stepProgress(10);
		});
		return true;
	},

	loadCronometer: function(){
		this.setPageTitle();
		this.loadTheme();
		this.loadCustomMenu();
		return false;
	},

	loadCustomMenu: function(){
		this.stepProgress(10);
		if(app.user.logged){
			$('#btnTempos').removeClass('hide');
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
						var answer = $("input[name='awesomeness']:checked").val()
						app.outputMessage("Hello " + name + ". You've chosen " + answer + "");
					}
				}
			}
		});

	},

	showUserDataScreen: function(){

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
						var answer = $("input[name='awesomeness']:checked").val()
						app.outputMessage("Hello " + name + ". You've chosen " + answer + "");
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
						var answer = $("input[name='awesomeness']:checked").val()
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
						app.feedback.name = $('#name').val();
						app.feedback.answer = $("input[name='awesomeness']:checked").val();
						app.feedback.message = $('#message').val();

						$.ajax({
							url: app.settings.apihost + "/system/feedback",
							method: "POST",
							data: {json: JSON.stringify(app.feedback) },
							crossDomain: true
						}).done(function(data) {
							var response = JSON.parse(data);
						}).fail(function() {
						}).always(function(){
						});
					}
				}
			}
		});

	},

	createAppElements: function(){
		this.stepProgress(10);
		$("#application").append('<div id="titleRow" class="row"></div>');
		$("#application").append('<div id="controlRow" class="row"></div>');
		$('#titleRow').append('<h1 id="appTitle"></h1><div id="timer" class="col-md-8 col-md-offset-2"></div>');
		$('#controlRow').append('<div id="startStop" class="button col-md-2 col-md-offset-3" onclick="app.startStopTimer();"><div id="startStopLabel"></div><div id="startStopInstruction" class="instructions"></div></div>');
		$('#controlRow').append('<div id="clear" class="button col-md-2 col-md-offset-2" onclick="app.clearTimer();"><div id="clearLabel"></div><div id="clearInstruction" class="instructions"></div></div>');
	},

	createButtonLinks: function(){
		this.stepProgress(10);
		$('#btnFeedback > a').click(function(e){ e.preventDefault(); app.showFeedbackForm(); });
		$('#btnLogin > a').click(function(e){ e.preventDefault(); app.facebookLogin(); });
		$('#btnLogout > a').click(function(e){ e.preventDefault(); app.appLogout(); });

		$('#btnUserData > a').click(function(e){ e.preventDefault(); app.showUserDataScreen(); });
		$('#btnSobre > a').click(function(e){ e.preventDefault(); app.showAboutScreen(); });
		$('#btnTempos > a').click(function(e){ e.preventDefault(); app.showMyTimers(); });

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

	createAPIURL: function(){
		return app.settings.apiSettings.apiProtocol +'://'+ app.settings.apiSettings.apiHost +':'+ app.settings.apiSettings.apiPort +'/'+ app.settings.apiSettings.apiPath;
	},

	makeAPICall: function(endPoint, method, sendData, callback){

        var responseData = '';

        $.ajax({
            url: app.createAPIURL() + endPoint,
            method: method,
            data: sendData,
            crossDomain: true
        }).done(function(data) {
            responseData = JSON.parse(data);
            app.outputMessage('API Call Successfull!');
        }).fail(function() {
            responseData = JSON.parse('{"result":"failed"}');
            app.outputMessage('API Call Failed!');
        }).always(function(){
            callback(responseData);
		});

    },

	loadTheme: function(){
		this.stepProgress(10);
		this.outputMessage('Loading theme');

		if(app.settings.debug){
			if(app.user.id!=''){
				console.log('theme for user: '+ app.user.id);
			}else{
				console.log('theme generic');
			}
		}

		var apiReturn = app.makeAPICall('/user/loadtheme', 'GET', '{ userid : '+app.user.id+'}', function(response){
            console.log('callback de themeload! ' + response.result);

            // app.theme.backgroundImage = image.image_name;
            // app.theme.appTitleColor = image.logo_color;

            app.theme.backgroundImage = app.settings.defaultBG;
            app.theme.setTheme();
            app.stepProgress(10);
		} );

		// $.ajax({
		// 	url: app.createAPIURL() + "/theme/loadTheme",
		// 	method: "POST",
		// 	data: { userid : app.user.id },
		// 	crossDomain: true
		// }).done(function(data) {
		// 	var image = JSON.parse(data);
		// 	app.outputMessage('Loaded random background from api: '+ image.image_name);
		// 	app.theme.backgroundImage = image.image_name;
		// 	app.theme.appTitleColor = image.logo_color;
		// }).fail(function() {
		// 	app.outputMessage('Ajax failed! Using default background: '+ app.settings.defaultBG);
		// 	app.theme.backgroundImage = app.settings.defaultBG;
		// }).always(function(){
		// 	app.theme.setTheme();
		// 	app.stepProgress(10);
		// });

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

		app.timerInfo.user_id 	= app.user.id;
		app.timerInfo.start 	= app.format_date(app.startTime);
		app.timerInfo.end 		= app.format_date(app.finalTime);
		app.timerInfo.timer 	= app.format_seconds(app.currentTimer);

		console.log(JSON.stringify(app.timerInfo));

		if(app.timerInfo.user_id!=''){
			$.ajax({
				url: app.settings.apihost + "/timer/recordUserTimer",
				method: "POST",
				data: {json: JSON.stringify(app.timerInfo) },
				crossDomain: true
			}).done(function(data){
			}).fail(function(){
			}).always(function(){
			});
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
		this.stepProgress(10);
		this.outputMessage('Binding keyboard shortcuts');
		window.onbeforeunload = app.confirmExit;
		$(document).keydown(function(event){
			app.keyDefaults( event );
		}).keyup(function(event){
			app.keyHandler( event );
		});
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
	},

}


// START THE APP
$(document).ready(function(){
	app.init();
});