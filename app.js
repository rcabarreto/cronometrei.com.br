var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var _ = require('underscore');

var db = require('./db.js');
var middleware = require('./middleware.js')(db);


var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);






// TODO: paste api calls here

app.get('/api', function(req, res){
    res.send('Welcome to Contability API!');
});

app.get('/api/user', middleware.requireAuthentication, function(req, res){
    res.send('Welcome to Contability API!');
});



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


db.sequelize.sync({force:true}).then(function() {
    var themes = [ {theme_name: "London", image_name: "london.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Borabora", image_name: "borabora.jpg", logo_color: "#F4FCFA", active: 1}, {theme_name: "Bubbles", image_name: "bubbles.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Road", image_name: "road.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Squares", image_name: "150305-cinqAA_by_Pierre_Cante.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Snow", image_name: "11220682974_9d296080f3_k.jpg", logo_color: "##E7E8EB", active: 1}, {theme_name: "Sunlight", image_name: "11416120446_76a5ae1b18_k.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Boat", image_name: "12591084605_c926ed2c7d_k.jpg", logo_color: "#FFF", active: 1}, {theme_name: "Balloons", image_name: "12735618625_bbe342c702_k.jpg", logo_color: "#587065", active: 1}, {theme_name: "Christmas Lights", image_name: "Christmas_Lights_by_RaDu_GaLaN.jpg", logo_color: "#FFF", active: 1} ];
    db.theme.bulkCreate(themes).then(function (themes) {}, function (e) {});
});



module.exports = app;
