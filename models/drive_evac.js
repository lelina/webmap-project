let mongoose = require('mongoose')

let schema = mongoose.Schema({
  forAddress: String,
  location: {
    type: {type: String},
    coordinates: []
  },
  length: Number,
  points: [{x: Number, y: Number}],
  timeEstimated: Number,
})

schema.index({location: '2dsphere'})

module.exports = mongoose.model('DriveEvac', schema)
