var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,
  // initialize: function() {
  //   this.on('saving', function(){
  //     bcrypt.genSalt(10, function(err, salt) {
  //       console.log('initialize:', this);
  //       console.log('salt: ', salt);
  //     }
  //   });
      // bcrypt.hash(this.password, salt, function(err, hash) {
      //   if(err) throw err;
      //   console.log('hash: ', hash);
      //   this.password = hash;
      //   this.save;
      // });
  // }
});

module.exports = User;
