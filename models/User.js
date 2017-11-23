var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true},
  company_name: {type: String, lowercase: true, unique: true},
  address1: {type: String, lowercase: true, unique: true},
  address2: {type: String, lowercase: true, unique: true},
  city: {type: String, lowercase: true, unique: true},
  state: {type: String, lowercase: true, unique: true},
  zip: {type: String, lowercase: true, unique: true},
  contact_name: {type: String, lowercase: true, unique: true},
  contact_phone: {type: String, lowercase: true, unique: true},
  gst: {type: String, lowercase: true, unique: true},
  pan: {type: String, lowercase: true, unique: true},
  aut: {type: String, lowercase: true, unique: true},
  bank_name: {type: String, lowercase: true, unique: true},
  ifsc: {type: String, lowercase: true, unique: true},
  account: {type: String, lowercase: true, unique: true},
  swiftcode: {type: String, lowercase: true, unique: true},
  hash: String,
  salt: String  
});

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'SHA1').toString('hex');
}

UserSchema.methods.validatePassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000,64,'SHA1').toString('hex');  
  return this.hash === hash;
}

UserSchema.methods.generateJWT = function () { 
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  
  return jwt.sign({
    _id: this._id,
    username: this.username,
    company_name: this.company_name,
    address1: this.address1,
    address2: this.address2,
    city: this.city,
    state: this.state,
    zip: this.zip,
    contact_name: this.contact_name,
    contact_phone: this.contact_phone,
    gst: this.gst,
    pan: this.pan,
    aut: this.aut,
    bank_name: this.bank_name,
    ifsc: this.ifsc,
    account: this.account,
    swiftcode: this.swiftcode,
    exp:parseInt(exp.getTime() /1000)
  }, 'SECRET'
  );
}

mongoose.model('User', UserSchema);


