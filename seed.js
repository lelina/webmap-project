// TODO: tạo mã seed DB

const mongoose = require('mongoose')
let Evac = require('./models/evac')

mongoose.connect('mongodb://binhsonnguyen.com:8000/today')

Evac.collection.drop()

// readFile().toJson().forEach() {
//
// }

new Evac({
  forAddress: "160 Vu Pham Ham",
  addressGPS: {
    "x": -43.57032122469974,
    "y": 172.755133778481479
  },
  length: 852.32928107600003,
  points: [
    {
      "x": -43.569782970819006,
      "y": 172.755754377317913
    },
    {
      "x": -43.569513446600467,
      "y": 172.755879149539425
    },
    {
      "x": -43.569154520403075,
      "y":172.756251646261802
    },
    {
      "x": -43.569019758022392,
      "y": 172.756314030749905
    },
    {
      "x": -43.571707209562284,
      "y": 172.762023746341612,
    }
  ]
}).save()
