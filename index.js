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



function colloctHotels(params , num) {
  dic = []

  for (var i = 0; i < num; i++) {

    var s1 = "_package[hotels]["+parseInt(i)+"][hotel_name]";
    var s2 = "_package[hotels]["+parseInt(i)+"][number_of_star]";
    var s3 = "_package[hotels]["+parseInt(i)+"][stay_place]";
    var s4 = "_package[hotels]["+parseInt(i)+"][stay_duration]";
    var s5 = "_package[hotels]["+parseInt(i)+"][one_bed_price]";
    var s6 = "_package[hotels]["+parseInt(i)+"][two_bed_person]";

    dic.push({
      hotel_name: params[s1],
      number_of_star: params[s2],
      stay_place: params[s3],
      stay_duration: params[s4],
      one_bed_price: params[s5],
      two_bed_person: params[s6]

        });

  }
  return dic;
}

app.post('/posters/add',function(req, res) {


  var newPoster ={
    poster_id : md5(""+req.body['_package[package_seed]']),
    phase : req.body['_package[phase]'],
    date : req.body['_package[date]'],
    hotels : colloctHotels(req.body, req.body['_package[number_of_hotel]'])
  };

  var num_res;

  // db.posters.find(function (err, docs) {
  //   num_res = docs.length
  // });

  // console.log( db.posters.count({"poster_id" : "123"},function(){}) );
  // if (num_res === 0) {
      db.packages.insert(newPoster, function () {
      });

      var upd;
      db.packages.find(function (err, docs) {
      	// docs is an array of all the documents in mycollection
        res.json({ info: docs });
        });

        // return "upg";

  // }
  // else{
    // db.posters.update({poster_id : newPoster['poster_id']}, {$set: {hotels:newPoster['hotels']}}, function (){} );
  // }


});


// db.posters.insert(newPoster,function(err,res) {
//   if (err) {
//     console.log(err);
//   }
//   res.redirect('/');
// })

app.listen(3000,function() {
  console.log("on port 3000 Server is Running...");
})
