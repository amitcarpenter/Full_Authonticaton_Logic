const express = require('express')
const userRoutes = require('./routes/userRoutes.js')
// const exphbs = require('express-handlebars')
// const exphbss = require("express-handlebars")
// const nunjucks = require('nunjucks');
const adminRoutes = require('./routes/adminRoutes.js')
const path = require('path')

const bodyParser = require('body-parser')
const app = express()
//another way with handlebars
// app.engine('handlebars', exphbs());
// app.engine('handlebars', exphbss.create());
// app.set('view engine', 'handlebars');

app.set('view engine', 'ejs');
app.use('/assets', express.static(path.join(__dirname, 'views/assets')));
app.set('views', path.join(__dirname + '/views/html'));

//set Engine for handle bars
// app.engine('.hbs', exphbs({ extname: '.hbs' }))
// app.set('view engine', '.hbs')

//for directed connect with html
// app.get('/', (req, res) => {
//   const filePath = path.join(__dirname, 'views/html', 'index.html');
// })

// use Nunjucks for the use html template
// nunjucks.configure('views/html', {
//   autoescape: true,
//   express: app
// });

// set Engine for view directry
// app.set('view engine', 'html');
// app.set('view engine', 'ejs');

//views directry
// app.set('views', path.join(__dirname, 'views/html'));
// console.log(__dirname,  "/views/html")

app.use(express.static('public'))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', userRoutes)
app.use('/admin', adminRoutes)

app.get('/notfound', (req, res) => {
  res.render('pages-misc-error')
})
app.get('/usernotfound', (req, res) => {
  res.render('pages-misc-error')
})

app.get('/newpassword', (req, res) => {
  res.render('newPassword.ejs')
})
app.get('/gotoemail', (req, res) => {
  res.render('gotoEmail.ejs')
})

module.exports = app
