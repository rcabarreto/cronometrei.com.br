var doing;
var time;
var currentTimer;
var loop;
var needToConfirm = false;

window.onbeforeunload = confirmExit;

// prevent user from closing or exiting the page when timer is running
function confirmExit(){
	if(needToConfirm)
		return "message to display in dialog box";
}


$(document).ready(function(){
	$(document).bind('keyup', 'space', startStopTimer);
	$(document).bind('keyup', 'esc', clearTimer);
});


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

	loop = window.setInterval("update()", 1);
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

	//document.title = minutes + ":" + seconds + ":" + milliseconds + " - Cronometrei";
	return minutes + ":" + seconds + ":" + milliseconds;
}