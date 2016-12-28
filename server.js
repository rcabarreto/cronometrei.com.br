/**
 * Created by barreto on 27/12/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
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


app.get('/', function (req, res) {
    res.send('Todo API Root');
});

app.get('/api', middleware.requireAuthentication, function(req, res){
    res.send('Welcome to Contability API!');
});

app.post('/api/user/newuser', function(req, res){

    console.log(req.body);

    req.body.user_id = req.body.id;

    console.log(req.body);

    var body = _.pick(req.body, 'user_id', 'email', 'first_name', 'last_name', 'gender', 'link', 'locale', 'name', 'timezone', 'password');

    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    });

});

app.get('/api/user/:userid/theme', function(req, res){
    res.json(JSON.parse('{"imageName": "borabora.jpg", "logoColor": "#F4FCFA"}'));
});

app.get('/api/user/:userid/info', function(req, res){
    var userid = req.params.userid;
    res.json(JSON.parse('{"id":"'+userid+'","email":"rcabarreto@gmail.com","first_name":"Rodrigo","last_name":"Barreto","gender":"male","link":"https://www.facebook.com/app_scoped_user_id/10152835496865807/","locale":"pt_BR","name":"Rodrigo Barreto","timezone":-2,"updated_time":"2016-12-26T13:12:15+0000","verified":true}'))
});


app.post('/api/user/newtimer', function(req, res){
    console.log(req.body);

    var body = _.pick(req.body, 'user_id', 'start', 'end', 'timer');

    db.timer.create(body).then(function(timer) {
        res.json(timer.toJSON());
    }, function(e) {
        res.status(400).json(e);
    });

});

// app.use(express.static(__dirname + '/public'));



app.post('/api/user/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken('authentication');

        if (token) {
            res.header('Auth', token).json(user.toPublicJSON());
        } else {
            res.status(401).send();
        }

    }, function() {
        res.status(401).send();
    });


});



app.get('*', function(req, res){
    res.status(404).send();
});


db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log('Cronometrei API Server Started Successfully on port '+ PORT +'!');
    });
});