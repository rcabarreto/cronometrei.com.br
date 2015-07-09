
var app = {
	settings: {
		debug: false,
		titleSep: ' - ',
		pageTitle: 'Cronometrei',
		homeTitleFull: 'O tempo, sob controle',
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

	init: function(){
		if(app.settings.debug)
			console.log('Initializing app');

		// set unload function to prevent users from closing the crono window
		window.onbeforeunload = app.confirmExit;

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

		return false; // done
	},
	createAppCanvas: function(){
		//$("#application").append('<div id="titleRow" class="row"></div>');
		//$("#application").append('<div id="controlRow" class="row"></div>');
		//$('#titleRow').append('<h1 id="appTitle"></h1><div id="timer" class="col-md-8 col-md-offset-2"></div>');
		//$('#controlRow').append('<div id="startStop" class="button col-md-2 col-md-offset-3" onclick="app.startStopTimer();"><div id="startStopLabel"></div><div id="startStopInstruction" class="instructions"></div></div>');
		//$('#controlRow').append('<div id="clear" class="button col-md-2 col-md-offset-2" onclick="app.clearTimer();"><div id="clearLabel"></div><div id="clearInstruction" class="instructions"></div></div>');
	},
	setPageTitle: function(){
		document.title = app.settings.pageTitle + app.settings.titleSep + app.settings.homeTitleFull;
		//$('h1#appTitle').html(app.settings.pageTitle);
		$('#startStopLabel').html(app.settings.startButton);
		$('#startStopInstruction').html(app.settings.startInstruction);
		$('#clearLabel').html(app.settings.clearButton);
		$('#clearInstruction').html(app.settings.clearInstruction);
	},
	keyDefaults: function(event){
		switch(event.keyCode) {
			case 32: // SPACE
				event.preventDefault();
				break;
			case 27: // ESC
				event.preventDefault();
				break;
			default:
				return false;
		}
	},
	keyHandler: function(event){
		switch(event.keyCode) {
			case 32: // SPACE
				app.startStopTimer();
				break;
			case 27: // ESC
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

		// get randon image
		var imageName = 'gallery_2_557_212946-1600x900.jpg';

		$('body').css('background-image', 'url("assets/images/'+imageName+'")');
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

		if(confirm(app.settings.clearMessage)){
			app.stopTimer();
			app.settings.needToConfirm = false;
			app.settings.time = 0;
			app.settings.currentTimer = 0;
			app.sendToScreen(app.format_seconds(0));
		}
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

