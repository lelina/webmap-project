'use strict'
require('dotenv').config()

const express = require('express')

const mongoose = require('mongoose')
mongoose.connect(`${process.env.MONGO}/webmap-production`)

const bodyParser = require('body-parser')

let app = express()
app.set('views', './views')
app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(use404)

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/evac/:lat/:lon', (req, res) => {
  let coor = getEvac(req.params['evacId'])
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(coor))
})

// 404 ROUTE

app.listen(8000, () => {
  console.log('Server started at http://localhost:8000')
})

function getEvac (evacId) {
  return getFaker()
}

function use404 (req, res, next) {
  res.status(404).render('404.ejs')
}
