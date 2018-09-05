var express = require('express');
var mongojs = require('mongojs');
const url = require('url');
var path  = require('path');
var bodyParser = require('body-parser');
var md5 = require('md5');
const multer = require('multer');
const DIR_UPLOAD  = "uploads/";

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


// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}


// Public Folder
app.use(express.static('./public'));

app.post('/debug',(req,res)=>{
  console.log(req.body);
});

app.post('/color/:id',function (req,res) {
  console.log(req.body);
  db.poster.update({pos_id: req.params.id}, {$set: {color_id: req.body.color}}, {multi: true}, function () {
    res.redirect("/"+req.params.id);
  });
});

app.post('/update_name/:id',function (req,res) {
  console.log(req.body);
  db.poster.update({pos_id: req.params.id}, {$set: {name: req.body.pos_name}}, {multi: true}, function () {
    res.redirect("/"+req.params.id);
  });
});

app.post('/upload/:id',(req, res) => {
  // console.log(req.file);
  let id = req.params.id;
  upload(req, res, (err) => {
    if(err){
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        db.poster.update({pos_id: id}, {$set: {background_image: req.file.filename}}, {multi: true}, function () {
        });
        db.packages.find({poster_id:id},function (err, docs) {
          var func = function (packages) {
            db.items.find({poster_id:id},function (err, docs) {
              console.log(docs,packages);
              res.redirect('/'+id);
            });
          }
          func(docs);
        });
      }
    }
  });
});


var i = 0;

app.get('/home',function (req,res) {
  db.poster.find().toArray(function (err, docs) {
    // docs is an array of all the documents in mycollection
    res.render('home',{
      poster: docs,
      UPLOAD_DIR : "uploads/"
   });
 });
});

app.get('/new',function(req,res) {
  var seed = md5(Math.floor((Math.random() * 100) + 1)+"");
  var new_pos = {
    pos_id:seed,
    time : new Date(),
    background_image : null,
    name: null
  };
  db.poster.insert(new_pos,function(err,response) {
    res.redirect('/'+seed);
  });
});


app.get('/:id',function(req,res) {

  var doc=[],serv=[];
  db.packages.find({poster_id:req.params.id},function (err, docs) {
    // var func = function (packages) {
      var packages = docs;
      console.log("1");
      db.items.find({poster_id:req.params.id},function (err, docs) {
        // var func_image = function (packages,items) {
          var items = docs;
          console.log("2");
          db.poster.findOne({pos_id:req.params.id},function (err,pos) {
            console.log("3");
            console.log(packages,items,pos);
            var f = function (pos) {
              if(pos){
                res.render('index',{
                  poster_id: req.params.id,
                  title: 'Posters',
                  file: DIR_UPLOAD + pos.background_image,
                  back_color : pos.color_id,
                  posters: packages,
                  items : items
                });
            }
            }
            f(pos);

          });
        // };
        // func_image(packages,docs);
      });
    // }
    // func(docs);
  });
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



app.listen(3000,function() {
  console.log("on port 3000 Server is Running...");
})
