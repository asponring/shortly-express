var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
express.session = require('express-session');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var passkey = require('./password');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(cookieParser());

app.get('/',
function(req, res) {

  util.checkUser(req.cookies, function(result){
    if(result){
      res.render('index');
    } else {
      res.redirect('/login');
    }
  });


});

app.get('/login',
function(req, res) {
  res.render('login');
});

app.post('/login',
function(req, res) {
  var username = req.body.username;
  var password = req.body.password + passkey.hashKey;

  new User({ username: username }).fetch().then(function(found) {
    if (found) {
      var hash = found.get('password');
      util.validateUser(password, hash, function(result) {
        if (result) {
          util.makeCookie(username, res, function(){
            res.redirect('/');
          });
        } else {
          res.redirect('/login');
        }
      });
    } else {
      res.redirect('/login');
    }
  });
});



app.get('/create',
function(req, res) {
  util.checkUser(req.cookies, function(result){
    if(result){
      res.render('index');
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/links',
function(req, res) {
  util.checkUser(req.cookies, function(result){
    if(result){
      Links.reset().fetch().then(function(links) {
        res.send(200, links.models);
      });
    } else {
      res.redirect('/login');
    }
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/signup',
function(req, res) {
  res.render('signup');
});

app.post('/signup', function(req, res){

  var username = req.body.username;
  var password = req.body.password + passkey.hashKey;
  var user;
  util.createHash(password, function(hash) {
    user = new User({
      username: username,
      password: hash
    });

    user.save().then(function(newUser) {
      Users.add(newUser);
      util.makeCookie(username, res, function(){
        res.redirect('/');
      });
    });
  });

});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/
app.get('/logout', function(req, res) {
  // delete all cookies
  // redirect to login page
  res.clearCookie('session');
  res.redirect('/');
});

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
