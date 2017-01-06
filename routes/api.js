/**
 * Created by barreto on 06/01/17.
 */
var express = require('express');
var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function (db, middleware) {

    var router = express.Router();

    router.get('/', function(req, res){
        res.send('Welcome to Contability API!');
    });


    router.post('/user', function(req, res){

        req.body.user_id = req.body.id;

        var body = _.pick(req.body, 'user_id', 'email', 'first_name', 'last_name', 'gender', 'link', 'locale', 'name', 'timezone', 'password');

        db.user.create(body).then(function(user) {
            res.json(user.toPublicJSON());
        }, function(e) {
            res.status(400).json(e);
        });

    });


    router.get('/user', middleware.requireAuthentication, function(req, res){

        var userId = req.user.get('id');

        db.user.findById(userId).then(function (user) {
            res.json(user.toJSON());
        }, function (e) {
            console.log(e);
            res.status(500).json(e)
        });

        // res.json(JSON.parse('{"id":"'+userid+'","email":"rcabarreto@gmail.com","first_name":"Rodrigo","last_name":"Barreto","gender":"male","link":"https://www.facebook.com/app_scoped_user_id/10152835496865807/","locale":"pt_BR","name":"Rodrigo Barreto","timezone":-2,"updated_time":"2016-12-26T13:12:15+0000","verified":true}'))
    });


    router.put('/user', middleware.requireAuthentication, function(req, res){

        var userId = req.user.get('id');
        var body = _.pick(req.body, 'email','gender','themeId');

        db.user.findById(userId).then(function (user) {
            if (user) {
                user.update(body).then(function (user) {
                    res.json(user.toPublicJSON());
                }, function (e) {
                    res.status(400).json(e);
                })
            } else {
                res.status(404).send();
            }

        }, function (e) {
            res.status(500).json(e)
        });

    });


    router.put('/user/setpassword', middleware.requireAuthentication, function (req, res) {

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


    router.post('/user/login', function (req, res) {
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


    router.delete('/user/login', middleware.requireAuthentication, function (req, res) {
        req.token.destroy().then(function () {
            res.status(204).send();
        }).catch(function () {
            res.status(500).send();
        });
    });


    router.post('/user/facebooklogin', function (req, res) {
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


    router.post('/timer/create', middleware.requireAuthentication, function(req, res){
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


    router.get('/timer/list', middleware.requireAuthentication, function (req, res) {

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


    router.get('/timer/:timerId', middleware.requireAuthentication, function (req, res) {
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


    router.delete('/timer/:timerId', middleware.requireAuthentication, function (req, res) {
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


    router.post('/feedback', function (req, res) {
        // create feedback in database

        var body = _.pick(req.body, 'name', 'answer', 'message');

        db.feedback.create(body).then(function (feedback) {
            res.json(feedback.toJSON());
        }, function (e) {
            res.status(400).json(e);
        })
    });


    router.get('/feedback', function (req, res) {
        db.feedback.findAll().then(function (feedbacks) {
            res.json(feedbacks);
        }, function (e) {
            res.status(500).send();
        });
    });


    router.get('/theme/:themeid', middleware.requireAuthentication, function(req, res){
        var themeId = req.params.themeid;
        db.theme.findById(themeId).then(function (theme) {
            res.json(theme.toJSON());
        }, function (e) {
            console.log(e);
            res.status(500).json(e)
        });
    });


    return router;

};
