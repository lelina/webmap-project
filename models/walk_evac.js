let mongoose = require('mongoose')

let schema = mongoose.Schema({
  forAddress: String,
  addressGPS:
    {
      x: Number,
      y: Number
    },
  length: Number,
  points: [{x: Number, y: Number}],
})

module.exports = mongoose.model('WalkEvac', schema)