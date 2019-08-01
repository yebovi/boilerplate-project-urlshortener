'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var cors = require('cors');
var dns = require('dns');
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }, function(err,db){if(err){console.log(err)}else{console.log('connected to ' + process.env.MONGO_URI)}})
app.use(cors());

const Url = mongoose.model('Url', { original_url: String, short_url:Number});


/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}))
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//url shortner
 app.use('/api/shorturl/new',function(req,res,next){
  var longUrl=req.body.url;
   var shortUrl;
   Url.find({original_url:longUrl},function(err,Url){
    if(Url.length){
    shortUrl= Url[0].short_url;
    res.send({original_url:longUrl,short_url:shortUrl})
        }
     else{
       next()
     }
       })
 
 })       
 app.use('/api/shorturl/new',function(req,res,next){
  var longUrl=req.body.url;
   var shortUrl;
   if(!/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm.test(longUrl)){
    res.send({"error":"Invalid url format, make sure you have a valid protocol."})
        }
     else{
       next()
     }
       })

 app.use('/api/shorturl/new',function(req,res,next){
  var longUrl=req.body.url;
   var shortUrl;
   const REPLACE_REGEX = /^https?:\/\//i
   var  url1= longUrl.replace(REPLACE_REGEX, '').split("/");
   dns.lookup(url1[0],(err, addresses)=> {
         if(err){
           res.send({Error:"Invalid Hostname"})
         }
 else {
   shortUrl=Math.round(Math.random()*1000);
  const urlShortner = new Url({ original_url: longUrl,short_url:shortUrl });
urlShortner.save().then(()=>console.log("url saved"))        
         res.send({ original_url: longUrl,short_url:shortUrl })
}
 });
       })


app.use('/api/shorturl/:number',(req,res)=>{
  var shortUrl=req.params.number;
  Url.find({short_url:shortUrl},function(err,Url){
    if (err) throw err
   if(Url.length){var originalUrl = Url[0].original_url
   var result =res.redirect(originalUrl)
    return result;}
  else{
    return res.send({Error:"ShortUrl is Invalid"})
  }
  }
  )
  })
app.listen(process.env.PORT, function () {
  console.log('Node.js listening on ' + port);
});
