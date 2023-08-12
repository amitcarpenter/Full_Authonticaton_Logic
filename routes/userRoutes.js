const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const session = require('express-session')
const { sessoinSecret } = require('../config/configSecret')




const {
  userRegister,
  userLogin,
  forgot_password,
  reset_password,
  verifyMail,
  loginLoader,
  registerLoad,
  homeLoad,
  userLogout,
  forgotLoad,
  newPasswordPage,
  verificationLoad,
  sendVarificatinLink,
  editProifile,
  updateProfile,
  loadProfile,
  editProfileLoader ,
  cardLoad, 
} = require('../controllers/userController')

const { isLogout, isLogin } = require('../middleware/auth')

router.use(
    session({
      secret:sessoinSecret, 
      resave: false,  // Set resave option to false
      saveUninitialized: false  // Set saveUninitialized option to false
    })
  );


router.use(express.static("public"))

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




router.get('/register', isLogout, registerLoad)

router.post('/register', upload.single('image'), userRegister)

router.get('/', isLogout, loginLoader)

router.get('/login', isLogout, loginLoader)

router.post('/login', userLogin)

router.get('/home', isLogin, homeLoad)

router.get("/forgot" , isLogout , forgotLoad)

router.post("/forgot" , isLogout , forgot_password)

// router.post('/forgot_password',isLogout ,  forgot_password)

// router.get('/forgot',isLogin ,  reset_password)

router.get('/verify', verifyMail)

router.get("/logout" , isLogin , userLogout)

router.get("/reset-password" , newPasswordPage)

router.post("/reset-password" , reset_password)

router.get("/verification" , verificationLoad)

router.post("/verification" , sendVarificatinLink)

router.get("/editProfile" , isLogin , editProfileLoader)

router.get("/cards" , isLogin ,cardLoad)

router.get("/edit" , isLogin , editProifile)

router.post("/edit" , upload.single("image") , updateProfile)

router.get("/profile" , isLogin , loadProfile)

module.exports = router
