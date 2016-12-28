/**
 * Created by barreto on 27/12/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = 3000;

var middleware = {
    requireAuthentication: function(req, res, next){
        console.log('private route hit!');
        next();
    },
    logger: function(req, res, next){
        console.log(req.method +' '+ req.originalUrl);
        next();
    }
}

app.use(middleware.logger);
app.use(bodyParser.json());

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});

app.get('/api', middleware.requireAuthentication, function(req, res){
    res.send('Welcome to Contability API!');
});

app.get('/api/user/loadtheme', function(req, res){
    res.send('{"result": "success", "data": {"imageName": "borabora.jpg", "logoColor": "#FF0"}}');
});

app.get('/api/user/loaduserinfo/:userid', function(req, res){
    var userid = req.params.userid;
    res.send('{"result": "success", "data": {"id":"'+userid+'","email":"rcabarreto@gmail.com","first_name":"Rodrigo","last_name":"Barreto","gender":"male","link":"https://www.facebook.com/app_scoped_user_id/10152835496865807/","locale":"pt_BR","name":"Rodrigo Barreto","timezone":-2,"updated_time":"2016-12-26T13:12:15+0000","verified":true}}');
});

app.post('/api/user/newtimer', function(req, res){
    console.log(req.body);
    res.send('{"result": "success", "data": '+ JSON.stringify(req.body) +'}');
});

// app.use(express.static(__dirname + '/public'));

db.sequelize.sync({force: true}).then(function() {
    app.listen(PORT, function() {
        console.log('Cronometrei API Server Started Successfully on port '+ PORT +'!');
    });
});