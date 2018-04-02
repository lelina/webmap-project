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
  let alertPanel = {
    appearanceColor: function(){
      if(this.futureRisk.isExisted ===false) return 'alert-panel--false'
      else return 'alert-panel--true'
    },
    futureRisk: {
      isExisted: false
    },
    date: new Date()

  }
  res.render('index', {
    alertPanel: alertPanel,
    currentUser: req.user
  })
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

app.post('/c', (req, res) => {
  let addr = req.body['address']; // TODO: from bodyparse
  let coor = getGPSFromAddress(addr)
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(coor));
})

// 404 ROUTE
app.use(function(req, res, next) {
  res.status(404).render('404.ejs');
})

app.listen(8000, () => {
  console.log('Server started at http://localhost:8000')
})


function  getGPSFromAddress (addr) {
  // TODO: find the first one that have address exists in...
  let evac = {
    forAddress: "44 TAYLORS MISTAKE BAY SUMNER",
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
  };
  return evac;
}

