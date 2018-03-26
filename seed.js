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
    "x": 1580226.941789227770641,
    "y": 5175819.710968014784157
  },
  length: 852.32928107600003,
  points: [
    {
      "x": 1580226.941789227770641,
      "y": 5175819.710968014784157
    },
    {
      "x": 1580276.87980301422067,
      "y": 5175879.636584554798901
    },
    {
      "x": 1580286.867405767086893,
      "y": 5175909.599392824806273
    },
    {
      "x": 1580316.830214035930112,
      "y": 5175949.549803851172328
    },
    {
      "x": 1580321.824015416670591,
      "y": 5175964.531207986176014
    }
  ]
}).save()
