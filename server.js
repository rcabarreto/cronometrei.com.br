/**
 * Created by barreto on 27/12/16.
 */
var express = require('express');
var app = express();
var PORT = 3000;

app.get('/api', function(req, res){
    res.send('Welcome to Contability API!');
});

// app.use(express.static(__dirname + '/public'));

app.listen(PORT, function(){
    console.log('Contability API Server Started Successfully!');
});