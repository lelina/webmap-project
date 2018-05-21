'use strict'
require('dotenv').config()

const express = require('express')

const mongoose = require('mongoose')
mongoose.Promise = Promise

const bodyParser = require('body-parser')

const DriveEvac = require('./models/drive_evac')
const WalkEvac = require('./models/walk_evac')

const DEBUG = process.env.DEBUG

let app = express()

let walkAddresses = []
let driveAddresses = []
let _allAddresses = []

app.set('views', './views')
app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.render('index')
})

function allAddresses () {
  if (!_allAddresses || _allAddresses.length == 0) {
    let id = 0

    walkAddresses.forEach(walk => {
      let previousAdded = _allAddresses.find(item => item.address === walk.address)
      if (!!previousAdded) {
        if (!previousAdded.readIds.walk) previousAdded.readIds.walk = []
        previousAdded.readIds.walk.push(walk.id)
      } else {
        _allAddresses.push({
          id: id++,
          readIds: {walk: [walk.id]},
          address: walk.address
        })
      }
    })

    driveAddresses.forEach(drive => {
      let previousAdded = _allAddresses.find(item => item.address === drive.address)
      if (!!previousAdded) {
        log('dupplicate', previousAdded)
        if (!previousAdded.readIds.drive) previousAdded.readIds.drive = []
        previousAdded.readIds.drive.push(drive.id)
      } else {
        _allAddresses.push({
          id: id++,
          readIds: {drive: [drive.id]},
          address: drive.address
        })
      }
    })
  }
  return _allAddresses
}

app.get('/addresses', (req, res) => {
  log(allAddresses().filter(item => !item.address).length)
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(allAddresses().filter(item => !!item.address)))
})

app.get('/resolve/:id', async (req, res) => {
  let address = allAddresses().find(item => item.id == req.params.id)

  if (!address) {
    log('Invalid argument!')
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({failed: 1}))
    return
  }

  let result = {drives: [], walks: []}

  let tasks = (address.readIds.drive || [])
    .map(id => {
      return DriveEvac
        .findOne({_id: id})
        .exec()
        .then(evac => {
          if (!!evac) result.drives.push(evac)
        })
    })
    .concat((address.readIds.walk || []).map(id => {
      return WalkEvac
        .findOne({_id: id})
        .exec()
        .then(evac => {
          if (!!evac) result.walks.push(evac)
        })
    }))

  await Promise.all(tasks).catch(err => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({failed: 1}))
  })

  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(result))

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

mongoose
  .connect(`${process.env.MONGO}/webmap-production`)
  .then(() => {
    log('mongoose connected!')
    startApp()
  })

async function startApp () {
  let gatherWalks = WalkEvac
    .find({})
    .exec()
    .then(evacs => {
      evacs.forEach(function (evac) {
        walkAddresses.push({id: evac._id.toString(), address: evac.forAddress})
        log('walkEvacs ' + walkAddresses.length)
      })
    })

  let gatherDrives = DriveEvac
    .find({})
    .exec()
    .then(evacs => {
      evacs.forEach(function (evac) {
        driveAddresses.push({id: evac._id.toString(), address: evac.forAddress})
        log('driveEvacs ' + driveAddresses.length)
      })
    })

  await Promise.all([gatherWalks, gatherDrives])

  app.listen(8000, () => console.log('Server started at http://localhost:8000'))

}

function log (msg) {
  if (DEBUG) console.log(`APP: ${msg}`)
}
