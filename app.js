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

// 404 ROUTE
app.use(function(req, res, next) {
  res.status(404).render('404.ejs');
})


app.listen(8000, () => {
  console.log('Server started at http://localhost:8000')
})