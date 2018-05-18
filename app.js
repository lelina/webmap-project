'use strict'
require('dotenv').config()

const express = require('express')

const mongoose = require('mongoose')
mongoose.connect(`${process.env.MONGO}/webmap-production`)

const bodyParser = require('body-parser')

const DriveEvac = require('./models/drive_evac')
const WalkEvac = require('./models/walk_evac')

const DEBUG = process.env.DEBUG

let app = express()

let walkAddresses = []
let driveAddresses = []
let allAddresses = []

app.set('views', './views')
app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/addresses', (req, res) => {
  if (!allAddresses || allAddresses.length == 0) {
    let id = 0
    allAddresses = walkAddresses.map(walk => ({
      id: id++,
      readId: {walk: walk.id},
      address: walk.address
    }))
    driveAddresses.forEach(drive => {
      let previousAdded = allAddresses.find(existed => existed.address === drive.address)
      if (!!previousAdded) {
        previousAdded.readId.drive = drive.id
      } else {
        allAddresses.push({
          id: id++,
          readId: {drive: drive.id},
          address: drive.address
        })
      }
    })
  }
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(allAddresses))
})

app.get('/drive/:suggestion', (req, res) => {
  let address = req.params.suggestion
  findDriveEvac(address, onErr, onFound)

  function onErr (err) {
    log(err)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({failed: 1}))
  }

  function onFound (evac) {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(evac))
  }

  function findDriveEvac (address, onErr, onFound) {
    let regex = new RegExp('^' + address + '$', 'i')
    DriveEvac.findOne({forAddress: address}, function (err, evac) {
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

WalkEvac.find({}).exec((err, evacs) => {
  evacs.forEach(function (evac) {
    walkAddresses.push({id: evac._id, address: evac.forAddress})
    log('walkEvacs ' + walkAddresses.length)
  })
})

DriveEvac.find({}).exec((err, evacs) => {
  evacs.forEach(function (evac) {
    driveAddresses.push({id: evac._id, address: evac.forAddress})
    log('driveEvacs ' + driveAddresses.length)
  })
})

app.listen(8000, () => {
  console.log('Server started at http://localhost:8000')
})

function log (msg) {
  if (DEBUG) console.log(`APP: ${msg}`)
}
