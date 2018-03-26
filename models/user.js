let passportLocalMongoose = require('passport-local-mongoose')
let mongoose = require('mongoose')

let UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String
})

UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', UserSchema)
