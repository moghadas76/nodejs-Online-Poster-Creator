var express = require('express');
var mongojs = require('mongojs');
var path  = require('path');
var bodyParser = require('body-parser');
var md5 = require('md5');

var db = mongojs('poster_app', ['posters','tmp']);
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
  db.posters.find(function (err, docs) {
  	// docs is an array of all the documents in mycollection
    res.render('index',{
      title: 'Posters',
      posters: docs
    });
  })
});


app.post('/posters/add',function(req, res) {
  // var newPoster ={
  //   poster_id : md5(""+req.body['_package[package_seed]']),
  //   poster_name : req.body['_package[package_seed]'],
  //   validation_form_from : req.body._package.validation_form_from,
  //   validation_form_to : req.body._package.validation_form_to,
  //   packages : req.body._package.packages,
  //   services : req.body._package.services
  // };

    console.log(req.body['_package[hotel]']);
    // db.posters.insert(newPoster,function(err,res) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   res.redirect('/');
  // })
});


app.listen(3000,function() {
  console.log("on port 3000 Server is Running...");
})
