/* ========================================================================
 * Cronometrei Webapp
 * http://www.cronometrei.com.br
 * Version: 2.0
 * ========================================================================
 * Copyright 2014-2015 R3 Web Solutions
 * Licensed under MIT
 * ======================================================================== */

var app = {
	doing: false,
	time: 0,
	currentTimer: 0,
	loop: false,
	progressValue: 0,
	isOnline: false,
	settings: {
		debug: false,
		fbAppID: '387506448107274',
		apihost: 'http://api.cronometrei.com.br/app',
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
		facebook_id: "",
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

		// detecting development mode
		var url = window.location.pathname;
		var filename = url.substring(url.lastIndexOf('/')+1);
		if(filename === "dev.php"){
			console.log('##########################################################\n##    Development mode detected. Going verbose mode.    ##\n########################################################## \n\n');
			app.settings.debug = true;
		}

		if(app.settings.debug)
			console.log('Initializing app');

		// starting progressbar
		this.stepProgress(10);

		// preventing user from closing the window
		window.onbeforeunload = app.confirmExit;

		if(app.settings.debug)
			console.log('Starting facebook integration');

		// starting facebook integration
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

		return false;
	},

	checkInternetConnectivity: function(){

		Offline.check();

	},

	checkLoginState: function(){
		this.stepProgress(10);
		FB.getLoginStatus(function(response) {
			app.statusChangeCallback(response);
		});
	},

	statusChangeCallback: function(response){

		this.stepProgress(10);

		if (response.status === 'connected') {
			if(app.settings.debug)
				console.log('User logged into your app and Facebook! Fetching information.... ');
			app.user.logged = true;
			app.loadFacebookInfo();
		}else if(response.status === 'not_authorized'){
			if(app.settings.debug)
				console.log('User is logged into Facebook, but not your app. Loading default app.... ');
			app.user.logged = false;
			app.stepProgress(10);
			app.loadCronometer();
		}else{
			if(app.settings.debug)
				console.log('User is not logged into Facebook, so we\'re not sure if they are logged into this app or not. Loading default app.... ');
			app.user.logged = false;
			app.stepProgress(10);
			app.loadCronometer();
		}
	},

	facebookLogin: function(){},

	facebookLogout: function(){
		FB.api('/me/permissions', 'delete', function(response) {
			if(response.success){ console.log("DESLOGADO!"); }
		});
	},

	loadFacebookInfo: function(){
		FB.api('/me', function(user){
			app.loadUserInformation(user);
		});
	},

	loadUserInformation: function(user){

		if(app.settings.debug)
			console.log('loading user info...');

		$.ajax({
			url: app.settings.apihost + "/user/loadUserInfo",
			method: "POST",
			data: {json: JSON.stringify(user) },
			crossDomain: true
		}).done(function(data) {
			var response = JSON.parse(data);

			app.user.id 		  = response.userid;
			app.user.facebook_id  = response.id;
			app.user.email 		  = response.email;
			app.user.first_name   = response.first_name;
			app.user.last_name 	  = response.last_name;
			app.user.gender 	  = response.gender;
			app.user.link 		  = response.link;
			app.user.locale 	  = response.locale;
			app.user.name 		  = response.name;
			app.user.timezone 	  = response.timezone;
			app.user.updated_time = response.updated_time;
			app.user.verified 	  = response.verified;

			if(app.settings.debug)
				console.log('user info loaded');
			// load the app
			app.loadCronometer();
		}).fail(function() {
			if(app.settings.debug)
				console.log('Userinfo loagind failed, going on with default user info...');
			// load the app anyway
			app.loadCronometer();
		}).always(function(){
			app.stepProgress(10);
		});
		return true;
	},

	loadCronometer: function(){

		app.settings.needToConfirm = false;
		app.time = 0;
		app.currentTimer = 0;

		app.createAppElements();
		this.stepProgress(10);

		app.output(app.format_seconds(0));
		this.stepProgress(10);

		app.setPageTitle();
		this.stepProgress(10);

		app.loadTheme();
		this.stepProgress(10);

		if(app.settings.debug)
			console.log('Binding keyboard shortcuts');
		$(document).keydown(function(event){
			app.keyDefaults( event );
		}).keyup(function(event){
			app.keyHandler( event );
		});

		return false;
	},

	showLoginModal: function(){
		bootbox.dialog({
			title: "Faça seu login com o Facebook",
			message: '<div class="fb-login-button" data-max-rows="1" data-size="xlarge" data-show-faces="false" data-auto-logout-link="false"></div>'
		});

		// call facebook sdk
		FB.XFBML.parse();

		// bootbox.dialog({
		// 	title:   "Faça seu login no Cronometrei.",
		// 	message: '<div class="row">  ' +
		// 			 '<div class="col-md-12"> ' +
		// 			 '<form class="form-horizontal"> ' +
		// 			 '<div class="form-group"> ' +
		// 			 '<label class="col-md-4 control-label" for="name">Name</label> ' +
		// 			 '<div class="col-md-4"> ' +
		// 			 '<input id="name" name="name" type="text" placeholder="Your name" class="form-control input-md"> ' +
		// 			 '<span class="help-block">Here goes your name</span> </div> ' +
		// 			 '</div> ' +
		// 			 '<div class="form-group"> ' +
		// 			 '<label class="col-md-4 control-label" for="awesomeness">How awesome is this?</label> ' +
		// 			 '<div class="col-md-4"> <div class="radio"> <label for="awesomeness-0"> ' +
		// 			 '<input type="radio" name="awesomeness" id="awesomeness-0" value="Really awesome" checked="checked"> ' +
		// 			 'Really awesome </label> ' +
		// 			 '</div><div class="radio"> <label for="awesomeness-1"> ' +
		// 			 '<input type="radio" name="awesomeness" id="awesomeness-1" value="Super awesome"> Super awesome </label> ' +
		// 			 '</div> ' +
		// 			 '</div></div>' +
		// 			 '</form></div></div>',
		// 	buttons: {
		// 		success: {
		// 			label: "Save",
		// 			className: "btn-success",
		// 			callback: function () {
		// 				var name = $('#name').val();
		// 				var answer = $("input[name='awesomeness']:checked").val()
		// 				Example.show("Hello " + name + ". You've chosen <b>" + answer + "</b>");
		// 			}
		// 		}
		// 	}
		// });

	},

	createAppElements: function(){
		$("#application").append('<div id="titleRow" class="row"></div>');
		$("#application").append('<div id="controlRow" class="row"></div>');
		$('#titleRow').append('<h1 id="appTitle"></h1><div id="timer" class="col-md-8 col-md-offset-2"></div>');
		$('#controlRow').append('<div id="startStop" class="button col-md-2 col-md-offset-3" onclick="app.startStopTimer();"><div id="startStopLabel"></div><div id="startStopInstruction" class="instructions"></div></div>');
		$('#controlRow').append('<div id="clear" class="button col-md-2 col-md-offset-2" onclick="app.clearTimer();"><div id="clearLabel"></div><div id="clearInstruction" class="instructions"></div></div>');
	},

	setPageTitle: function(){
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

	loadTheme: function(){

		this.stepProgress(10);

		if(app.settings.debug)
			console.log('Loading theme');

		if(app.settings.debug){
			if(app.user.id!=''){
				console.log('theme for user: '+ app.user.id);
			}else{
				console.log('theme generic');
			}
		}

		$.ajax({
			url: app.settings.apihost + "/theme/loadTheme",
			method: "POST",
			data: { userid : app.user.id },
			crossDomain: true
		}).done(function(data) {
			var image = JSON.parse(data);
			if(app.settings.debug)
				console.log('Loaded random background from api: '+ image.image_name);
			app.theme.backgroundImage = image.image_name;
			app.theme.appTitleColor = image.logo_color;
		}).fail(function() {
			if(app.settings.debug)
				console.log('Ajax failed! Using default background: '+ app.settings.defaultBG);
			app.theme.backgroundImage = app.settings.defaultBG;
		}).always(function(){
			app.theme.setTheme();
			app.stepProgress(10);
		});
	},

	stepProgress: function(step){
		this.progressValue+=step;
		app.loadingProgress(this.progressValue);
	},

	loadingProgress: function(progress) {
		$('.progress-bar').css('width', progress+'%').attr('aria-valuenow', progress).html(progress+'%');
		if(progress>=100){
			setTimeout(function(){
				$('#progressbar').hide();
				$('#application').removeClass('opaque');
				$('header > nav').removeClass('opaque');
				if(app.user.logged){
					$('#btnTempos').removeClass('hide');
					$('#btnAccount').removeClass('hide');
				}else{
					$('#btnLogin').removeClass('hide');
					$('#btnLogin > a').click(function(e){ e.preventDefault(); app.showLoginModal(); });
				}
			}, 1000);
		}
	},






	// nothing changes from here on down
	startStopTimer: function() {
		if(app.settings.debug)
			console.log('Call start/stop timer');
		if (app.doing)
			app.pauseTimer();
		else
			app.startTimer(app.currentTimer);
		return false;
	},

	startTimer: function(currentTimer) {
		if(app.settings.debug)
			console.log('Starting timer');
		app.settings.needToConfirm = true;
		app.doing = 1;
		if(typeof(app.currentTimer) == 'undefined'){
			app.time = new Date();
		}else{
			app.time = (new Date() - app.currentTimer);
		}
		app.loop = window.setInterval("app.update()", 10);
		$('#startStopLabel').html(app.settings.pauseButton);
	},

	stopTimer: function() {
		if(app.settings.debug)
			console.log('Stopping timer');
		app.doing = 0;
		clearInterval(app.loop);
		$('#startStopLabel').html(app.settings.startButton);
	},

	pauseTimer: function(){
		if(app.settings.debug)
			console.log('Pausing timer');
		app.doing = 0;
		clearInterval(app.loop);
		app.currentTimer = app.getTime();
		$('#startStopLabel').html(app.settings.continueButton);
	},

	clearTimer: function(){
		if(app.settings.debug)
			console.log('Clear timer');
		bootbox.confirm(app.settings.clearMessage, function(result) {
			if(result){
				app.stopTimer();
				app.settings.needToConfirm = false;
				app.time = 0;
				app.currentTimer = 0;
				app.output(app.format_seconds(0));
			}
		});
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
}


// START THE APP
$(document).ready(function(){
	app.init();
});