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
  }],
  timeEstimated: Number,
})

schema.index({location: '2dsphere'})

module.exports = mongoose.model('DriveEvac', schema)
