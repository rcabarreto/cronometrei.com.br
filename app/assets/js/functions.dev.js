
var titleSep = ' - ';
var pageTitle = 'Cronometrei';
var exitMessage = 'Seu cronometro será perdido, deseja mesmo sair?';


var doing;
var time;
var currentTimer;
var loop;
var needToConfirm = false;


window.onbeforeunload = confirmExit;

function confirmExit(){
	if(needToConfirm)
		return exitMessage;
}


$(document).ready(function(){

	init();

	$(document).bind('keyup', 'space', startStopTimer);
	$(document).bind('keyup', 'esc', clearTimer);
});


function init(){
	$('#timer').html('00:00:00:000');
	return false;
}

function startStopTimer() {
	if (doing)
		pauseTimer();
	else
		startTimer(currentTimer);
	return false;
}


function startTimer(currentTimer) {
	needToConfirm = true;
	doing = 1;

	if(typeof(currentTimer) == 'undefined'){
		time = new Date();
	}else{
		time = (new Date() - currentTimer);
	}

	loop = window.setInterval("update()", 10);
}


function stopTimer() {
	doing = 0;
	clearInterval(loop);
}


function pauseTimer(){
	doing = 0;
	clearInterval(loop);
	currentTimer = getTime();
}


function clearTimer(){
	if(confirm('Zerar?')){
		stopTimer();
		needToConfirm = false;
		time = 0;
		currentTimer = 0;
		$('#timer').text(format_seconds(0));		
	}
}





function update() {
	printTime(format_seconds(getTime()));
}





function printTime(time){
	$('#timer').text(time);
}

function getTime(){
	return (new Date() - time);
}

function format_seconds(seconds) {
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

	document.title = hours + ":" + minutes + ":" + seconds + titleSep + pageTitle;
	return hours + ":" + minutes + ":" + seconds + ":" + milliseconds;
}