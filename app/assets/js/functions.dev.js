
var app = {

	doing: false,
	time: 0,
	currentTimer: 0,
	loop: false,

	settings: {
		debug: true,
		titleSep: ' - ',
		pageTitle: 'Cronometrei',
		homeTitleFull: 'O tempo, sob controle',
		defaultBG: 'london.jpg',
		startButton: 'Iniciar',
		pauseButton: 'Pausar',
		continueButton: 'Continuar',
		clearButton: 'Limpar',
		startInstruction: 'Barra de Espaço',
		clearInstruction: 'Esc',
		exitMessage: 'Seu cronometro será perdido, deseja mesmo sair?',
		clearMessage: 'Deseja mesmo zerar seu cronometro?',
		needToConfirm: false,
		fbAppID: '387506448107274',
	},

	user: {
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
		options: {},
	},
	
	theme: {
		backgroundImage: "",
		appTitleColor: "",
	},

	init: function(){
		if(app.settings.debug)
			console.log('Initializing app');

		if(app.settings.debug)
			console.log('Starting facebook integration');

		window.fbAsyncInit = function() {
			FB.init({
				appId      : app.settings.fbAppID,
				cookie     : true,  // enable cookies to allow the server to access the session
				xfbml      : true,  // parse social plugins on this page
				version    : 'v2.2' // use version 2.2
			});

			FB.getLoginStatus(function(response) {
				app.statusChangeCallback(response);
			});

		};

		// set unload function to prevent users from closing the crono window
		window.onbeforeunload = app.confirmExit;

		return false;
	},

	loadCronometer: function(){

		// create body divs
		app.createAppCanvas();

		// erase the timer
		app.settings.needToConfirm = false;
		app.time = 0;
		app.currentTimer = 0;
		app.sendToScreen(app.format_seconds(0));

		// set page title and background
		app.setPageTitle();
		app.loadTheme();

		if(app.settings.debug)
			console.log('Binding keyboard shortcuts');

		// set key bindings
		$(document).keydown(function(event){
			app.keyDefaults( event );
		}).keyup(function(event){
			app.keyHandler( event );
		});

		return false;
	},

	checkLoginState: function(){
		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});
	},

	statusChangeCallback: function(response){
		if (response.status === 'connected') {
			// Logged into your app and Facebook.
			if(app.settings.debug)
				console.log('User logged in! Fetching information.... ');
			FB.api('/me', function(user) {
				// send this data to database on an ajax call
				// load app with user profile settings			
				if(!app.loadUserInformation(user)){
					console.log("Error loading user info object! Continuing with default user view instead...")
				}

			});

		}else if(response.status === 'not_authorized'){
			// The person is logged into Facebook, but not your app.
			console.log("User is logged into Facebook, but not your app.");
			console.log("Loading default user view for this app.")
			app.loadCronometer();

		}else{
			// The person is not logged into Facebook, so we're not sure if
			// they are logged into this app or not.
			console.log("User is not logged into Facebook, so we're not sure if they are logged into this app or not..... ");
			console.log("Loading default user view for this app.")
			app.loadCronometer();

		}

	},

	loadUserInformation: function(user){

		$.ajax({
			url: "http://api.cronometrei.com.br/app/user/loadUserInfo",
			method: "POST",
			data: {json: JSON.stringify(user) },
			crossDomain: true
		}).done(function(data) {
			var response = JSON.parse(data);
			//console.log(response);
			app.user.id 		  = response.appid;
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
			
			app.loadCronometer();

		}).fail(function() {
		}).always(function(){
		});

	},

	createAppCanvas: function(){
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
		if(app.settings.debug)
			console.log('Loading theme');

		var imageName = '';

		if(app.settings.debug)
			console.log('Trying the API...');

		$.ajax({
			url: "http://api.cronometrei.com.br/app/theme/loadTheme",
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
			// set everything
			$('body').css('background-image', 'url("assets/images/background/'+app.theme.backgroundImage+'")');
			$('#appTitle').css('color', app.theme.appTitleColor);
		});

	},
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
		// set button label do PAUSE
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
		// set button label to START
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
				app.sendToScreen(app.format_seconds(0));
			}
		});

	},
	update: function(){
		app.sendToScreen(app.format_seconds(app.getTime()));
	},
	sendToScreen: function(output){
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

$(document).ready(function(){
	app.init();
});

