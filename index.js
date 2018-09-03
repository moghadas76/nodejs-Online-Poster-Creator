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

var i = 0;

app.get('/home',function (req,res) {
  db.poster.find().toArray(function (err, docs) {
    // docs is an array of all the documents in mycollection
    res.render('home',{
      poster: docs
   });
 });
});

app.get('/new',function(req,res) {
  var seed = md5(Math.floor((Math.random() * 100) + 1)+"");
  var new_pos = {
    pos_id:seed
  };
  db.poster.insert(new_pos,function(err,response) {
    res.redirect('/'+seed);
  });
});


app.get('/:id',function(req,res) {

  var doc=[],serv=[];
  db.packages.find({poster_id:req.params.id}).toArray(function (err, docs) {
    var func = function (packages) {
      db.items.find({poster_id:req.params.id},function (err, docs) {
        // docs is an array of all the documents in mycollection
        res.render('index',{
          poster_id: req.params.id,
         title: 'Posters',
         posters: packages,
         items : docs
       });
      });
    }
    // console.log(docs);
    func(docs);
    // return docs;
  });
  // f2();
  // f3(res, doc, serv);
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
  id =  req.body['_package[package_seed]'];
  var newPoster ={
    poster_id : req.body['_package[package_seed]'],
    phase : req.body['_package[phase]'],
    date : req.body['_package[date]'],
    hotels : colloctHotels(req.body, req.body['_package[number_of_hotel]'])
  };
  console.log(newPoster);

      db.packages.insert(newPoster, function (err,response) {
        res.redirect("/"+id);
      });

});

app.post('/items/add/:id',function (req,res) {
  var items = {
    poster_id: req.params.id,
    item_content : req.body.item_content
  };

  console.log(items);

  db.items.insert(items, function (err,response) {
    console.log("item_inserted!!");
    res.redirect("/"+req.params.id);
  });
})


// db.posters.insert(newPoster,function(err,res) {
//   if (err) {
//     console.log(err);
//   }
//   res.redirect('/');
// })

app.listen(3000,function() {
  console.log("on port 3000 Server is Running...");
})
