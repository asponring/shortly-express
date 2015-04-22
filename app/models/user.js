var db = require('../config');
var Promise = require('bluebird');
var bcrypt = require('bcrypt-nodejs');
Promise.promisifyAll(bcrypt);
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
  bcrypt.compareAsync(value, hash)
  .then(function(result){
    cb(result);
  })
  .catch(function(error){
    cb(false);
  });
};

exports.createHash = function(value, cb) {
  bcrypt.hashAsync(value, null, null)
  .then(function(hash) {
    cb(hash);
  })
  .catch(function(error) {
    throw error;
  });
};

// module.exports = User;
