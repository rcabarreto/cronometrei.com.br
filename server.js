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






app.get('*', function(req, res){
    res.status(404).send();
});






db.sequelize.sync().then(function() {

    // var themes = [ {theme_name: "London", image_name: "london.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Borabora", image_name: "borabora.jpg", logo_color: "#F4FCFA", active: 1}, {theme_name: "Bubbles", image_name: "bubbles.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Road", image_name: "road.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Squares", image_name: "150305-cinqAA_by_Pierre_Cante.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Snow", image_name: "11220682974_9d296080f3_k.jpg", logo_color: "##E7E8EB", active: 1}, {theme_name: "Sunlight", image_name: "11416120446_76a5ae1b18_k.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Boat", image_name: "12591084605_c926ed2c7d_k.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Balloons", image_name: "12735618625_bbe342c702_k.jpg", logo_color: "#587065", active: 1}, {theme_name: "Christmas Lights", image_name: "Christmas_Lights_by_RaDu_GaLaN.jpg", logo_color: "#FFF", active: 1} ];
    // db.theme.bulkCreate(themes).then(function (themes) {}, function (e) {});

    app.listen(PORT, function() {
        console.log('Cronometrei API Server Started Successfully on port '+ PORT +'!');
    });
});