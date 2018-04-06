let express = require('express'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  expressSession = require('express-session'),
  bodyParser = require('body-parser')

let app = express()
let User = require('./models/User')
// CONNECT MONGODB
let url = 'mongodb://binhsonnguyen.com:8000/linalan'
mongoose.connect(url)
//SETTINGS
app.use(express.static(__dirname + '/public'))

app.set('views', './views')
app.set('view engine', 'ejs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
// AUTHENTICATE SETTINGS
app.use(expressSession({
  secret: "Ohmama",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// ===========
// ROUTES
// ===========
app.get('/', (req, res) => {
  res.render('index')
})

// AUTHENTICATION ROUTES
app.get('/login', function(req, res) {
  res.render('loginForm', {
    currentUser: req.user
  })
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}) ,function(req, res) {})

app.get('/register', function(req, res) {
  res.render('signUpForm', {
    currentUser: req.user
  })
})

app.post('/register', function(req, res) {
  User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, function(err, user) {
    if (err) {
      console.log(err)
      res.redirect('signUpForm')
    }
    passport.authenticate('local')(req, res, function() {
      res.redirect('/')
    })
  })
})

app.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})

app.post('/evac/:evacId', (req, res) => {
  let coor = getEvac(req.params['evacId'])
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(coor));
})

app.post('/evac', (req, res) => {
  let addr = req.body['address']; // TODO: from bodyparse
  let coor = getFaker(addr)
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(coor));
})

app.get('/', (req, res) => {
  let coord = {x: -43.57032122469974, y: 172.755133778481479}
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(coord));
})

// 404 ROUTE
app.use(function(req, res, next) {
  res.status(404).render('404.ejs');
})

app.listen(8000, () => {
  console.log('Server started at http://localhost:8000')
})


function inundationMap(){
  'use strict'
  return map
}

function getEvac(evacId) {
  return getFaker()
}

function  getFaker (addr) {
  // TODO: find the first one that has address exists in...
  let evac = {
    forAddress: '44 TAYLORS MISTAKE BAY SUMNER',
    addressGPS: {
      'x': -43.57032122469974,
      'y': 172.755133778481479
    },
    length: 852.32928107600003,
    drive: [
      {
        'x': -43.569782970819006,
        'y': 172.755754377317913
      },
      {
        'x': -43.569513446600467,
        'y': 172.755879149539425
      },
      {
        'x': -43.569154520403075,
        'y': 172.756251646261802
      },
      {
        'x': -43.569019758022392,
        'y': 172.756314030749905
      },
      {
        'x': -43.571707209562284,
        'y': 172.762023746341612,
      }
    ],
    driveTimeEstimated: 30,
    walk: [
      {
        'x': -43.569154520403075,
        'y': 172.756251646261802
      },
      {
        'x': -43.569019758022395,
        'y': 172.756314030749902
      },
      {
        'x': -43.571707209562287,
        'y': 172.762023746341609,
      },
      {
        'x': -43.571707209562284,
        'y': 172.762023746341612,
      }]

  };
  return evac;
}


