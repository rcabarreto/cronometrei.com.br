
var app = {
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
		doing: false,
		time: 0,
		currentTimer: 0,
		loop: false,
		needToConfirm: false,
	},

	user: {
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
		options: {},
	},

	init: function(){
		if(app.settings.debug)
			console.log('Initializing app');

		if(app.settings.debug)
			console.log('Starting facebook integration');

		window.fbAsyncInit = function() {
			FB.init({
				appId      : '387506448107274',
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
		app.settings.time = 0;
		app.settings.currentTimer = 0;
		app.sendToScreen(app.format_seconds(0));

		// set page title and background
		app.setPageTitle();
		app.setBackground();

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
			console.log('User logged in! Fetching information.... ');
			FB.api('/me', function(user) {
				var json = JSON.stringify(user);
				// send this data to database on an ajax call
				// load app with user profile settings
				console.log("Loading custom user view for this app.")
				if(app.loadUserInformation(user)){
					// message?
				}else{
					console.log("Error loading user info object! Continuing with default user view instead...")
				}
				app.loadCronometer();

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
		if(app.settings.debug)
			console.log('Loading user information...');

		app.user.id 		  = user.id;
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

		return true;
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
	setBackground: function(){
		if(app.settings.debug)
			console.log('Setting background image');

		var imageName = '';

		if(app.settings.debug)
			console.log('Trying the API...');

		$.ajax({
			url: "http://api.cronometrei.com.br/images/background",
			method: "POST",
			data: { userid : app.user.id },
			crossDomain: true
		}).done(function(data) {
			var image = JSON.parse(data);

			if(app.settings.debug)
				console.log('Loaded random background from api: '+ image.image_name);

			imageName = image.image_name;

		}).fail(function() {
			if(app.settings.debug)
				console.log('Ajax failed! Using default background: '+ app.settings.defaultBG);
			imageName = app.settings.defaultBG;
		}).always(function() {
			$('body').css('background-image', 'url("assets/images/background/'+imageName+'")');
		});


	},
	startStopTimer: function() {
		if(app.settings.debug)
			console.log('Call start/stop timer');

		if (app.settings.doing)
			app.pauseTimer();
		else
			app.startTimer(app.settings.currentTimer);
		return false;
	},
	startTimer: function(currentTimer) {
		if(app.settings.debug)
			console.log('Starting timer');

		app.settings.needToConfirm = true;
		app.settings.doing = 1;
		if(typeof(app.settings.currentTimer) == 'undefined'){
			app.settings.time = new Date();
		}else{
			app.settings.time = (new Date() - app.settings.currentTimer);
		}
		app.settings.loop = window.setInterval("app.update()", 10);
		// set button label do PAUSE
		$('#startStopLabel').html(app.settings.pauseButton);
	},
	stopTimer: function() {
		if(app.settings.debug)
			console.log('Stopping timer');

		app.settings.doing = 0;
		clearInterval(app.settings.loop);
		$('#startStopLabel').html(app.settings.startButton);
	},
	pauseTimer: function(){
		if(app.settings.debug)
			console.log('Pausing timer');

		app.settings.doing = 0;
		clearInterval(app.settings.loop);
		app.settings.currentTimer = app.getTime();
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
				app.settings.time = 0;
				app.settings.currentTimer = 0;
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
		return (new Date() - app.settings.time);
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

