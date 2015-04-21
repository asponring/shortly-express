var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var passkey = require('../../password');

exports.User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false
  // initialize: function() {
  //   this.on('creating', function(model, attrs, options){
  //   }
  // }
});

exports.makeCookie = function(username, res, cb) {
  this.createHash(username + passkey.userPasskey, function(hash) {
    res.cookie('session', username + '|' + hash);
    cb();
  });
};

exports.checkUser = function(cookie, cb){
  if(!cookie.session){
    return cb(false);
  }
  var userCookieInfo = cookie.session.split('|');
  this.validateUser(userCookieInfo[0] + passkey.userPasskey, userCookieInfo[1], function(result) {
    cb(result);
  });
};

exports.validateUser = function(value, hash, cb) {
  bcrypt.compare(value, hash, function(err, result) {
    if (err) throw err;
    cb(result);
  });
};

exports.createHash = function(value, cb) {
  bcrypt.hash(value, null, null, function(err, hash) {
    if (err) throw err;
    cb(hash);
  });
};

// module.exports = User;
