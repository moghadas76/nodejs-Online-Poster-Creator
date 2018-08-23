var express = require('express');
var mongojs = require('mongojs');
var path  = require('path');
var bodyParser = require('body-parser');

var db = mongojs('poster_app', ['posters']);
var app = express()


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname,'public')));

app.use(function (req, res, next) {
  res.locals.errors = null;
  next();
});

app.get('/',function(req,res) {
  // find everything
  db.mycollection.find(function (err, docs) {
  	// docs is an array of all the documents in mycollection
    res.render('index',{
      title: 'Posters',
      posters: docs
    });
  })
});


app.post('/posters/add',function(req, res) {
  var newPoster ={
    poster_name : req.body.poster_name,
    validation_form_from : req.body.validation_form_from,
    validation_form_to : req.body.validation_form_to,
    packages : req.body.packages,
    services : req.body.services
  }
  db.posters.insert(newPoster,function(err,res) {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  })
});
