const express = require('express')
const router = express.Router()
const session = require('express-session')
const bodyParser = require('body-parser')
const { sessoinSecret } = require('../config/configSecret')
const multer = require('multer')
const path = require('path')

// Multer use for file uplaod
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/userImages'))
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname
    cb(null, name)
  },
})
const upload = multer({ storage: storage })

//import All modules
const {
  LoadLogin,
  loginVerify,
  LoadHome,
  logout,
  forgotLoad,
  forgotVerify,
  forgotPasswordLoad,
  resetPassword,
  adminDashBoard,
  newUserLoad,
  addUser,
  editUser,
  updateUsers,
  deleteUser,
  exportUser,
  exportUserPDF,
} = require('../controllers/adminController')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { isLogout, isLogin } = require('../middleware/adminAuth')

// Express session for Token
router.use(
  session({
    secret: sessoinSecret,
    resave: false,
    saveUninitialized: false,
  }),
)

router.get('/', isLogout, LoadLogin)

router.post('/', loginVerify)

router.get('/home', isLogin, LoadHome)

router.get('/logout', isLogin, logout)

router.get('/forgot', isLogout, forgotLoad)

router.post('/forgot', isLogout, forgotVerify)

router.get('/forgot-password', isLogout, forgotPasswordLoad)

router.post('/forgot-password', isLogout, resetPassword)

router.get('/dashboard',  adminDashBoard)

router.get('/new-user', isLogin, newUserLoad)

router.post('/new-user', isLogin, upload.single('image'), addUser)

router.get('/edit-user', isLogin, editUser)

router.post('/edit-user', isLogin, updateUsers)

router.get('/delete-user', isLogin, deleteUser)

router.get('/export-user', isLogin, exportUser)

router.get('/export-user-pdf', isLogin, exportUserPDF)

// for all routes
router.get('/*', function (req, res) {
  res.redirect('/admin')
})

module.exports = router
