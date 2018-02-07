let express = require('express')
let app = express()

app.use(express.static(__dirname + '/public'))

app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  let alertPanel = {
    appearanceColor: function(){
      if(this.futureRisk.isExisted ===false) return 'alert-panel--false'
      else return 'alert-panel--true'
    },
    futureRisk: {
      isExisted: true
    },
    date: new Date()

  }
  res.render('index', {
    alertPanel: alertPanel
  })
})
app.use(function(req, res, next) {
  res.status(404).render('404.ejs');
});
app.listen(8000, () => {
  console.log('Server started')
})