var cronoApp = {

	titleSep: ' - ',
	pageTitle: 'Cronometrei',
	exitMessage: 'Seu cronometro será perdido, deseja mesmo sair?',
	needToConfirm: true,
	doing: false,
	time: 0,
	currentTimer: 0,
	loop: 0,

	init: function(){
		this.setPageTitle();
		console.log(this.exitMessage);
		if(this.needToConfirm)
			$(window).bind('beforeunload', function() { return confirm(this.exitMessage); });


	},

	setPageTitle: function(){
		document.title = this.pageTitle;
	},

	startStopTimer: function() {
		if(this.doing){
			cronoApp.pauseTimer();
		}else{
			cronoApp.startTimer(this.currentTimer);
		}

	},

	startTimer: function() {
		this.needToConfirm = true;
		this.doing = 1;

		if(typeof(this.currentTimer) == 'undefined'){
			time = new Date();
		}else{
			time = (new Date() - this.currentTimer);
		}

		this.loop = window.setInterval("cronoApp.update()", 1);
	},

	stopTimer: function() {
		this.doing = 0;
		clearInterval(this.loop);
	},

	pauseTimer: function(){
		this.doing = 0;
		clearInterval(this.loop);
		this.currentTimer = getTime();
	},

	update: function() {
		$('#timer').text(this.format_seconds(this.getTime()));
	},

	getTime: function(){
		return (new Date() - this.time);
	},

	format_seconds: function(seconds) {
		if(isNaN(seconds))
			seconds = 0;

		var diff = new Date(seconds);
		var minutes = diff.getMinutes();
		var seconds = diff.getSeconds();
		var milliseconds = diff.getMilliseconds();

		if (minutes < 10)
			minutes = "0" + minutes;
		if (seconds < 10)
			seconds = "0" + seconds;

		if (milliseconds < 10)
			milliseconds = "00" + milliseconds;
		else if (milliseconds < 100)
			milliseconds = "0" + milliseconds;

		document.title = minutes + ":" + seconds + ":" + milliseconds + this.titleSep + this.pageTitle;
		return minutes + ":" + seconds + ":" + milliseconds;
	},


};


cronoApp.init();

$(document).bind('keyup', 'space', cronoApp.startStopTimer);
$(document).bind('keyup', 'esc', cronoApp.clearTimer);
