const { User } = require('../models/userModels')
const nodemailer = require('nodemailer')
const config = require('../config/config')
const randomstirng = require('randomstring')
  const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//Bcypt

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash
  } catch (error) {
    console.log(error.massage)
  }
}

// for Send Mail
const sendVerifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: 'amitcarpenter199@gmail.com',
        pass: 'vqicrrupvqvjgljg',
      },
    })
    const mailOptions = {
      from: 'amitcarpenter199@gmail.com',
      to: email,
      subject: 'For varifiy Email',
      html: ` <p> Hii ${name} , Please Click Here to <a href="http://localhost:5000/verify?id=${user_id}" > Verify </a> Your Mail `,
    }
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err)
      } else {
        console.log('Email has been send')
      }
    })
  } catch (error) {
    console.log(error.massage)
  }
}

// Verify mail
const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } },
    )
    console.log('Email Verified')
    res.render('email-verified.ejs')
  } catch (error) {
    console.log(error.massage)
  }
}

// Reset Password
const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    })

    const resetPasswordUrl = `http://localhost:5000/reset_password?token=${token}`
    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: 'For Forget Password ',
      html: ` <p> Hii ${name} , Please Click Here to <a href="http://localhost:5000/reset-password?token=${token}" > Reset</a> Your Mail `,
    }

    transporter.sendMail(mailOptions, function (error, information) {
      if (error) {
        console.log('sendError', error)
      } else {
        console.log('Mail Has been sent', information.response)
      }
    })
  } catch (error) {
    res.status(400).send({ success: false, massage: error.massage })
  }
}

//Load for verified Email for forgot password
const newPasswordPage = (req, res) => {
  try {
    res.render('newpassword')
  } catch (error) {
    console.log(error.massage)
  }
}

//Home Loader
const homeLoad = async (req, res) => {
  try {
    // const userData = await User.findById({ _id: req.session.user_id })
    // res.sendFile('index.html', { root: './public/html' })
    res.render('index')
  } catch (error) {
    console.log(error.massage)
  }
}

// Register Load
const registerLoad = async (req, res) => {
  try {
    res.render('auth-register-basic')
    // res.sendFile('auth-register-basic', { root: './public/html' })
  } catch (error) {
    console.log(error.massage)
  }
}

// Register The User
const userRegister = async (req, res) => {
  const { name, email, password } = req.body

  try {
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).redirect('/login')
    }
    const hashedPassword = await securePassword(password)
    const newUser = await User.create({
      name,
      email,
      image: req.file.filename,
      password: hashedPassword,
      is_admin: 0,
    })
    if (newUser) {
      sendVerifyMail(name, email, newUser._id)
      res.render('auth-register-basic', { massage: 'Verify Your Email' })
    }
    const token = jwt.sign({ userId: newUser._id }, 'AMITCARPENTER')
  } catch (error) {
    console.error(error)
  }
}

// Login Load
const loginLoader = async (req, res) => {
  try {
    res.render('auth-login-basic')
  } catch (error) {
    console.log(error)
  }
}

// Login the User
const userLogin = async (req, res) => {
  const { email, password } = req.body
  // console.log(email , password)
  try {
    const user = await User.findOne({ email })
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (passwordMatch) {
        if (user.is_admin === 1) {
          res.redirect('/admin/')
        }
        if (user.is_verified === 0) {
          res.render('auth-login-basic', { massage: 'Please Verify Your Mail' })
        } else {
          req.session.user_id = user._id
          res.redirect('/home')
          console.log('Login Success Fully')
        }
      } else {
        res.render('auth-login-basic', {
          massage: 'Email and Password is Incorrect',
        })
      }
    } else {
      res.render('auth-login-basic', {
        massage: 'Email and Password is Incorrect',
      })
      console.log('login error')
    }
  } catch (error) {
    console.error(error)
  }
}

// Forgot Load
const forgotLoad = async (req, res) => {
  try {
    res.render('auth-forgot-password-basic')
    // res.sendFile('auth-forgot-password-basic.html', { root: './public/html' })
  } catch (error) {
    console.log(error)
  }
}

// forgot Password
const forgot_password = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (user) {
      if (user.is_verified === 0) {
        res.render('auth-forgot-password-basic', {
          massage: 'Please verify your mail ',
        })
        // res.sendFile(
        //   'auth-forgot-password-basic.html',
        //   { root: './public/html' },
        //   { massage: 'Please Verify Your Mail' },
        // )

        console.log('not verified')
      } else {
        const randomString = randomstirng.generate()

        const data = await User.updateOne(
          { email },
          { $set: { token: randomString } },
        )

        sendResetPasswordMail(user.name, user.email, randomString)
        console.log('Email is Sending')

        res.render('auth-forgot-password-basic', {
          massage: 'Email has been send your mail please check',
        })
        // res.sendFile('auth-forgot-password-basic.html', {
        //   root: './public/html',
        // })
      }
    } else {
      res.status(200).render('auth-forgot-password-basic', {
        massage_error: 'This Email Does Not Exist',
      })
    }
  } catch (error) {
   console.log(error)
  }
}

// Reset Password
const reset_password = async (req, res) => {
  try {
    const token = req.query.token
    const tokenData = await User.findOne({ token: token })

    if (tokenData) {
      const password = req.body.password
      const newPassword = await bcrypt.hash(password, 10)
      const userData = await User.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: '' } },
        { new: true },
      )
      res.render('passwordChanged.ejs', {
        massage: 'Password Changed , Please Login',
      })
    } else {
      res
        .status(200)
        .render('newPassword', { massage_error: 'This Link Has been expired' })
      console.log('token expired')
    }
  } catch (error) {
    console.log(error)
  }
}

// Logout the User
const userLogout = async (req, res) => {
  try {
    req.session.destroy()
    res.redirect('/login')
  } catch (error) {
    console.log(error)
  }
}

//For  verication Email Link
const verificationLoad = async (req, res) => {
  try {
    res.render('verification.ejs')
  } catch (error) {
    console.log(error.massage)
  }
}

//send Verification link
const sendVarificatinLink = async (req, res) => {
  const { email } = req.body
  const userData = await User.findOne({ email })
  if (userData) {
    sendVerifyMail(userData.name, userData.email, userData._id)
    res.render('verification.ejs', {
      massage: 'Verification Mail is send on you Mail Please Check Your Mail ',
    })
  } else {
    res.render('verication.ejs', { massage: 'Email Does Not Exist' })
  }
  try {
  } catch (error) {
    console.log(error.massage)
  }
}

//Account setting page loader
const editProfileLoader = async (req, res) => {
  try {
    res.render('pages-account-settings-account')
  } catch (error) {
    console.log(error)
  }
}

//User prfile edit And Load
const editProifile = async (req, res) => {
  try {
    const id = req.query.id
    const userData = await User.findById({ _id: id })
    if (userData) {
      res.render('pages-account-settings-account', { user: userData })
      // res.render('pages-account-settings-account')
    } else {
      res.redirect('/home')
    }
  } catch (error) {
    console.log(error)
  }
}

//Update Profile
const updateProfile = async (req, res) => {
  try {
    if (req.file) {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            image: req.file.filename,
            name: req.body.name,
            email: req.body.email,
          },
        },
      )
    } else {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        { $set: { name: req.body.name, email: req.body.email } },
      )
    }
    res.render('updateSuccess.ejs')
  } catch (error) {
    console.log(error.massage)
  }
}

//Profile Loader
const loadProfile = async (req, res) => {
  try {
    res.render('profile.ejs')
  } catch (error) {
    console.log(error)
  }
}

//get All users =>
const allUser = async (req, res) => {
  try {
    const user = await User.find()
    res.render('allUser.ejs', {
      users: user,
    })
  } catch (error) {
    console.log(error)
  }
}

//load card
const cardLoad = async (req, res) => {
  try {
    res.render('cards-basic')
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
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
  editProfileLoader,
  cardLoad,
}
