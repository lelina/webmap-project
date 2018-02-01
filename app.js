let express = require('express')
let app = express()

app.use(express.static(__dirname + '/public'))

app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('greeting')
})

app.listen(8000, () => {
  console.log('Server started')
})