let mongoose = require('mongoose')

let evacSchema = mongoose.Schema({
  forAddress: String,
  addressGPS:
    {
      x: Number,
      y: Number
    },
  length: Number,
  points: [{x: Number, y: Number}]
})

module.exports = mongoose.model('Evac', evacSchema)
