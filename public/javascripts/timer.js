/**
 * Created by barreto on 04/01/17.
 */

var Timer = function () {

    this.isWorking = false;
    this.loop = '';
    this.currentTimer = undefined; // Controle de pause/restart de timer
    this.startTime = 0;
    this.finalTime = 0;
    this.startLapTime = 0;
    this.endLapTime = 0;
    this.laps = [];

    this.start = function () {
        console.log("starting tomer!");
        this.isWorking = true;

        if (this.startTime===0) {
            this.startTime = new Date().getTime();
            this.startLapTime = this.startTime;
        } else {
            this.startLapTime = new Date().getTime();
        }

        // unpause test
        if(typeof(this.currentTimer) == 'undefined'){
            this.startTime = new Date().getTime();
            this.startLapTime = new Date().getTime();
        }else{
            this.startTime = (new Date().getTime() - this.currentTotalTimer);
            this.startLapTime = (new Date().getTime() - this.currentTimer);
        }

        this.loop = window.setInterval("app.currentTimer.update()", 10);

        $('#startStopLabel').html(app.settings.pauseButton);
        $('#clearLapLabel').html(app.settings.lapButton);

    };


    this.stop = function () {

        if(this.isWorking){

            console.log('Stopping timer!');
            this.isWorking = false;

            clearInterval(this.loop);
            this.currentTimer = this.getTime();
            this.currentTotalTimer = this.getTotalTime();

            this.output(this.getTime(), this.getTotalTime());
            // this.output(this.format_seconds(this.currentTimer));

            $('#startStopLabel').html(app.settings.continueButton);
            $('#clearLapLabel').html(app.settings.clearButton);

            this.finalTime = new Date().getTime();

            timerInfo = {
                start: this.format_date(this.startTime, 'full'),
                end: this.format_date(this.finalTime, 'full'),
                timer: this.format_seconds(this.currentTimer, 'full')
            };

        } else {
            console.log('Already stoped!');
        }

    };

    this.clear = function () {
        console.log('CLEAR timer called!');
        this.startTime = new Date().getTime();
        this.startLapTime = this.startTime;
        // this.output(this.format_seconds(this.getTime()));
        this.output(this.getTime(), this.getTotalTime());
        $('#totaltimer').addClass('hideTotalTimer');
        $('#startStopLabel').html(app.settings.startButton);
    };

    this.lap = function () {
        console.log('LAP timer called!');
        $('#totaltimer').removeClass('hideTotalTimer');

        var currentLap = {
            lapNumber: 1,
            lapTime: this.format_seconds(this.getTime(), 'full')
        };

        this.laps.push(currentLap);

        console.log(JSON.stringify(this.laps));

        this.startLapTime = new Date().getTime();

    };

    this.update = function(){
        this.output(this.getTime(), this.getTotalTime());
    };

    this.output = function(lapTime, totalTime){
        lapTime = this.format_seconds(lapTime, 'full');
        totalTime = this.format_seconds(totalTime, 'total');

        $('#maintimer').text(lapTime);
        $('#totaltimer').text(totalTime);
    };

    this.getTime = function(){
        return (new Date().getTime() - this.startLapTime);
    };

    this.getTotalTime = function () {
        return (new Date().getTime() - this.startTime);
    };

    this.pad2 = function(number) {
        return (number < 10 ? '0' : '') + number
    };

    this.format_date = function(dateVar){

        var dt = new Date(dateVar);
        var dtstring = dt.getFullYear()
            + '-' + this.pad2(dt.getMonth()+1)
            + '-' + this.pad2(dt.getDate())
            + ' ' + this.pad2(dt.getHours())
            + ':' + this.pad2(dt.getMinutes())
            + ':' + this.pad2(dt.getSeconds());

        return dtstring;

    };

    this.format_seconds = function(second, output){
        if(isNaN(second))
            second = 0;
        var diff = new Date(second);
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

        if (output == 'full'){
            document.title = hours + ":" + minutes + ":" + seconds + app.settings.titleSep + app.settings.pageTitle;
            return hours + ":" + minutes + ":" + seconds + ":" + milliseconds;
        } else {
            return hours + ":" + minutes + ":" + seconds;
        }

    };


    return this;
};
