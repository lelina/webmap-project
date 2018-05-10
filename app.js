'use strict'
require('dotenv').config()

const express = require('express')

const mongoose = require('mongoose')
// mongoose.connect(`${process.env.MONGO}/webmap-production`)
mongoose.connect('mongodb://binhsonnguyen.com:8000/webmap-production')

const bodyParser = require('body-parser')

const DriveEvac = require('./models/drive_evac')
const WalkEvac = require('./models/walk_evac')

const DEBUG = process.env.DEBUG

let app = express()
app.set('views', './views')
app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
// app.use(use404)

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/drive/:lat/:lon', (req, res) => {
  let coor = {
    lat: req.params.lat,
    lon: req.params.lon
  }

  findDriveEvac(coor, onErr, onFound)

  function onErr (err) {
    log(err)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({failed: 1}))
  }

  function onFound (evac) {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(evac))
  }

  function findDriveEvac (coor, onErr, onFound) {
    DriveEvac.findOne({
      'location': {
        '$nearSphere': {
          '$geometry': {
            'type': 'Point',
            'coordinates': [coor.lon, coor.lat]
          },
          '$maxDistance': 100
        }
      }
    }, function (err, evac) {
      return !!err || !evac ? onErr(err) : onFound(evac)
    })
  }

})

app.post('/walk/:lat/:lon', (req, res) => {
  let coor = {
    lat: req.params.lat,
    lon: req.params.lon
  }

  findWalkEvacs(coor, onErr, onFound)

  function onErr (err) {
    log(err)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({failed: 1}))
  }

  function onFound (evac) {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(evac))
  }

  function findWalkEvacs (coor, onErr, onFound) {
    WalkEvac.findOne({
      'location': {
        '$nearSphere': {
          '$geometry': {
            'type': 'Point',
            'coordinates': [coor.lon, coor.lat]
          },
          '$maxDistance': 50
        }
      }
    }, function (err, evac) {
      return !!err || !evac ? onErr(err) : onFound(evac)
    })
  }

})

// 404 ROUTE

app.listen(8000, () => {
  console.log('Server started at http://localhost:8000')
})

function use404 (req, res, next) {
  res.status(404).render('404.ejs')
}

function log (msg) {
  if (DEBUG) console.log(`APP: ${msg}`)
}
