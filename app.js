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
app.set('views', './views')
app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
// app.use(use404)

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/evac/:lat/:lon', (req, res) => {
  let coor = {
    lat: req.params.lat,
    lon: req.params.lon
  }

  findEvac(coor, onErr, onFound)

  function onErr (err) {
    log(err)
  }

  function onFound (evac) {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(evac))
  }
})

function findEvac(coor, onErr, onFound) {
  DriveEvac.findOne({}, function (err, evac) {
    return !!err ? onErr(err) : onFound(evac)
  })
}

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
