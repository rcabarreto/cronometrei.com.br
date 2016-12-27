/**
 * Created by barreto on 27/12/16.
 */
var express = require('express');
var app = express();
var PORT = 3000;

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/api', function(req, res){
    res.send('Welcome to Contability API!');
});

app.get('/api/user/loadtheme', function(req, res){
    res.send('{"result": "success"}');
});

app.get('/api/user/loaduserinfo', function(req, res){
    res.send('{"result": "success", "data": {"id":"10152835496865807","email":"rcabarreto@gmail.com","first_name":"Rodrigo","last_name":"Barreto","gender":"male","link":"https://www.facebook.com/app_scoped_user_id/10152835496865807/","locale":"pt_BR","name":"Rodrigo Barreto","timezone":-2,"updated_time":"2016-12-26T13:12:15+0000","verified":true}}');
});


// app.use(express.static(__dirname + '/public'));

app.listen(PORT, function(){
    console.log('Contability API Server Started Successfully!');
});