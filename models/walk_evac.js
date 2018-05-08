let mongoose = require('mongoose')

let schema = mongoose.Schema({
  forAddress: String,
  location: {
    type: {type: String},
    coordinates: []
  },
  length: Number,
  points: [{
    type: {type: String},
    coordinates: []
  }],})

schema.index({location: '2dsphere'})

module.exports = mongoose.model('WalkEvac', schema)
