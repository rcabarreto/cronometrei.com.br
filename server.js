/**
 * Created by barreto on 27/12/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var _ = require('underscore');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT ||  3000;


app.use(middleware.logger);
app.use(bodyParser.json());


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, Auth, X-Requested-With");
    res.header("Access-Control-Expose-Headers", "Authorization, Auth");
    next();
});


app.get('/', function (req, res) {
    res.send('Todo API Root');
});


app.get('/api', function(req, res){
    res.send('Welcome to Contability API!');
});


app.post('/api/user/create', function(req, res){

    req.body.user_id = req.body.id;

    var body = _.pick(req.body, 'user_id', 'email', 'first_name', 'last_name', 'gender', 'link', 'locale', 'name', 'timezone', 'password');

    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    });

});


app.get('/api/user', middleware.requireAuthentication, function(req, res){

    var userId = req.user.get('id');

    db.user.findById(userId).then(function (user) {
        console.log(user.toJSON());
        res.json(user.toJSON());
    }, function (e) {
        console.log(e);
        res.status(500).json(e)
    });

    // res.json(JSON.parse('{"id":"'+userid+'","email":"rcabarreto@gmail.com","first_name":"Rodrigo","last_name":"Barreto","gender":"male","link":"https://www.facebook.com/app_scoped_user_id/10152835496865807/","locale":"pt_BR","name":"Rodrigo Barreto","timezone":-2,"updated_time":"2016-12-26T13:12:15+0000","verified":true}'))
});


app.get('/api/user', middleware.requireAuthentication, function(req, res){

    var userId = req.user.get('id');

    db.user.findById(userId).then(function (user) {
        console.log(user.toJSON());
        res.json(user.toJSON());
    }, function (e) {
        console.log(e);
        res.status(500).json(e)
    });

    // res.json(JSON.parse('{"id":"'+userid+'","email":"rcabarreto@gmail.com","first_name":"Rodrigo","last_name":"Barreto","gender":"male","link":"https://www.facebook.com/app_scoped_user_id/10152835496865807/","locale":"pt_BR","name":"Rodrigo Barreto","timezone":-2,"updated_time":"2016-12-26T13:12:15+0000","verified":true}'))
});


app.put('/api/user/setpassword', middleware.requireAuthentication, function (req, res) {

    var userId = parseInt(req.user.get('id'), 10);
    var body = _.pick(req.body, 'password');

    if(typeof body.password !== 'string'){
        res.status(500).send();
    }

    db.user.findById(userId).then(function(user) {
        if (user) {
            user.update(body).then(function(user) {
                res.json(user.toPublicJSON());
            }, function(e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    });

});


app.post('/api/user/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken('authentication');
        userInstance = user;

        return db.token.create({
            token: token
        });

    }).then(function (tokenInstance) {
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function() {
        res.status(401).send();
    });

});


app.delete('/api/user/login', middleware.requireAuthentication, function (req, res) {
    req.token.destroy().then(function () {
        res.status(204).send();
    }).catch(function () {
        res.status(500).send();
    });
});


app.post('/api/user/facebooklogin', function (req, res) {
    var body = _.pick(req.body, 'user_id', 'name', 'first_name', 'last_name', 'email', 'gender', 'link', 'locale', 'timezone');
    var userInstance;

    db.user.facebookAuthenticate(body).then(function(user) {
        var token = user.generateToken('authentication');
        userInstance = user;

        return db.token.create({
            token: token
        });

    }).then(function (tokenInstance) {
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function() {
        res.status(401).send();
    });

});


app.post('/api/timer/create', middleware.requireAuthentication, function(req, res){
    console.log(req.body);

    // {"start":"2016-12-28 20:57:27","end":"2016-12-28 20:57:30","timer":"00:00:01:428"}

    var body = _.pick(req.body, 'start', 'end', 'timer');

    db.timer.create(body).then(function(timer) {
        // res.json(timer.toJSON());
        req.user.addTimer(timer).then(function () {
            return timer.reload();
        }).then(function (timer) {
            res.json(timer.toJSON());
        });
    }, function(e) {
        res.status(400).json(e);
    });

});


app.get('/api/timer/list', middleware.requireAuthentication, function (req, res) {

    var where = {
        userId: req.user.get('id')
    };

    db.timer.findAll({
        where: where
    }).then(function (timers) {
        res.json(timers);
    }, function (e) {
        res.status(500).send();
    });
});


app.get('/api/timer/:timerId', middleware.requireAuthentication, function (req, res) {
    var timerId = parseInt(req.params.timerId, 10);

    db.timer.findOne({
        where: {
            id: timerId,
            userId: req.user.get('id')
        }
    }).then(function (timer) {
        if (!!timer) {
            res.json(timer.toJSON());
        } else {
            res.status(404).send();
        }

    }, function (e) {
        res.status(500).send();
    });
});


app.delete('/api/timer/:timerId', middleware.requireAuthentication, function (req, res) {
    var timerId = parseInt(req.params.timerId, 10);

    db.timer.destroy({
        where: {
            id: timerId,
            userId: req.user.get('id')
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({
                error: 'No timer with id'
            });
        }else{
            res.status(204).send();
        }

    }, function (e) {
        res.status(500).send();
    });
});


// app.use(express.static(__dirname + '/public'));


app.post('/api/feedback', function (req, res) {
    // create feedback in database

    var body = _.pick(req.body, 'name', 'answer', 'message');

    db.feedback.create(body).then(function (feedback) {
        res.json(feedback.toJSON());
    }, function (e) {
        res.status(400).json(e);
    })
});


app.get('/api/feedback', function (req, res) {
    db.feedback.findAll().then(function (feedbacks) {
        res.json(feedbacks);
    }, function (e) {
        res.status(500).send();
    });
});


app.get('/api/theme/:themeid', middleware.requireAuthentication, function(req, res){
    var themeId = req.params.themeid;
    db.theme.findById(themeId).then(function (theme) {
        res.json(theme.toJSON());
    }, function (e) {
        console.log(e);
        res.status(500).json(e)
    });
});

app.get('*', function(req, res){
    res.status(404).send();
});


db.sequelize.sync({force:true}).then(function() {

    var themes = [ {theme_name: "London", image_name: "london.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Borabora", image_name: "borabora.jpg", logo_color: "#F4FCFA", active: 1}, {theme_name: "Bubbles", image_name: "bubbles.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Road", image_name: "road.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Squares", image_name: "150305-cinqAA_by_Pierre_Cante.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Snow", image_name: "11220682974_9d296080f3_k.jpg", logo_color: "##E7E8EB", active: 1}, {theme_name: "Sunlight", image_name: "11416120446_76a5ae1b18_k.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Boat", image_name: "12591084605_c926ed2c7d_k.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Balloons", image_name: "12735618625_bbe342c702_k.jpg", logo_color: "#587065", active: 1}, {theme_name: "Christmas Lights", image_name: "Christmas_Lights_by_RaDu_GaLaN.jpg", logo_color: "#FFF", active: 1} ];
    db.theme.bulkCreate(themes).then(function (themes) {}, function (e) {});

    app.listen(PORT, function() {
        console.log('Cronometrei API Server Started Successfully on port '+ PORT +'!');
    });
});