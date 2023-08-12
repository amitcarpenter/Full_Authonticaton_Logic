const { User } = require('../models/userModels')
const bcrypt = require('bcrypt')
const randomstring = require('randomstring')
const config = require('../config/config')
const nodemailer = require('nodemailer')
const excelJS = require('exceljs')
const pdf = require('html-pdf')
const fs = require('fs')
const ejs = require('ejs')
const path = require('path')

//send Verify Mail
const addUserMail = async (name, email, password, user_id) => {
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
      subject: 'Admin Add You This Mail For Your Password',
      html: ` <p> Hii ${name} , Please Click Here to <a href="http://localhost:5000/verify?id=${user_id}" > Verify </a> Your Mail <br>
      Name  :  ${name} <br><br>
      Email  : ${email} <br><br>
      Password : ${password}
       `,
    }
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err)
      } else {
        console.log('Email has been send')
      }
    })
  } catch (error) {
    console.log(error)
  }
}

//secure Password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash
  } catch (error) {
    console.log(error)
  }
}

// Send reset Password Mail
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

    // const resetPasswordUrl = `http://localhost:5000/admin/forgot-password??token=${token}`
    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: 'For Forget Password ',
      html: ` <p> Hii ${name} , Please Click Here to <a href="http://localhost:5000/admin/forgot-password?token=${token}" > Reset</a> Your Mail `,
    }

    transporter.sendMail(mailOptions, function (error, information) {
      if (error) {
        console.log('sendError', error)
      } else {
        console.log('Mail Has been sent', information.response)
      }
    })
  } catch (error) {
    console.log(error)
  }
}

// Load Login
const LoadLogin = async (req, res) => {
  try {
    res.render('adminLogin.ejs')
  } catch (error) {
    console.log(error)
  }
}

// Login Verify
const loginVerify = async (req, res) => {
  try {
    const { email, password } = req.body
    const userData = await User.findOne({ email })
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password)

      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render('adminLogin.ejs', {
            massage: 'Email And Password Does Not Match',
          })
        } else {
          req.session.user_id = userData._id

          res.redirect('/admin/home')
        }
      } else {
        res.render('adminLogin.ejs', {
          massage: 'Email And Password Does Not Match',
        })
      }
    } else {
      res.render('adminLogin.ejs', {
        massage: 'Email And Password Does Not Match',
      })
    }
  } catch (error) {
    console.log(error)
  }
}

//load Dashboard For admin
const LoadHome = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id })
    res.render('adminHome.ejs', { admin: userData })
  } catch (error) {
    console.log(error)
  }
}

//LogOut the Admin
const logout = async (req, res) => {
  try {
    req.session.destroy()
    res.redirect('/admin')
  } catch (error) {
    console.log('kay ba  ' + error)
  }
}

//Forgot Load =
const forgotLoad = async (req, res) => {
  try {
    res.render('forgot.ejs')
  } catch (error) {
    console.log(error)
  }
}

// Verify Forgot
const forgotVerify = async (req, res) => {
  try {
    const { email } = req.body
    const userData = await User.findOne({ email })
    if (userData) {
      if (userData.is_admin === 0) {
        res.render('forgot.ejs', { massage: 'Your Email is Incorrect' })
      } else {
        const randomString = randomstring.generate()
        console.log(randomString)

        const updatedData = await User.updateOne(
          { email },
          {
            $set: {
              token: randomString,
            },
          },
        )
        sendResetPasswordMail(userData.name, userData.email, randomString)
        console.log('Sending Email ')
        res.render('forgot.ejs', {
          massage: 'Email is Send Your Mail Please Check and verify ',
        })
      }
    } else {
      console.log('user is not available')
      res.render('forgot.ejs', { massage: 'Email is Incorrect' })
    }
  } catch (error) {
    console.log(error)
  }
}

//Forgot Password Load = >
const forgotPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token

    const tokenData = await User.findOne({ token: token })
    if (tokenData) {
      res.render('newPassword.ejs', { user_id: tokenData._id })
    } else {
      res.render('notFound.ejs')
      console.log('Page not Found')
    }
  } catch (error) {

    console.log(error)

  }
}

//Reset Passwrod and add new Password
const resetPassword = async (req, res) => {
  try {
    const { password, user_id } = req.body
    const securePasswords = await securePassword(password)
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: securePasswords, token: '' } },
      { new: true },
    )
    res.redirect('/admin')
  } catch (error) {
    console.log(error)
  }
}

//Admin Dashboard
const adminDashBoard = async (req, res) => {
  try {
    var search = ''

    if (req.query.search) {
      search = req.query.search
    }

    var page = 1


    if (req.query.page) {
      page = req.query.page
    }

    var limit = 2

    const limiter = parseInt(limit);
    const userData = await User.find({
      is_admin: 0,
      $or: [
        { name: { $regex: '.*' + search + '.*', $options: 'i' } },
        { email: { $regex: '.*' + search + '.*', $options: 'i' } },
      ],
    })
      .limit(limiter * 1)
      .skip((page - 1) * limiter)
      .exec()

    const count = await User.find({
      is_admin: 0,
      $or: [
        { name: { $regex: '.*' + search + '.*', $options: 'i' } },
        { email: { $regex: '.*' + search + '.*', $options: 'i' } },
      ],
    }).countDocuments()

    res.render('adminDashboard.ejs', {
      users: userData,
      totalPages: Math.ceil(count / limiter),
      currentPage: page,
      next: page + 1,
      previous: page - 1,
    })

  } catch (error) {
    console.log(error)
  }
}

//Load NewUser
const newUserLoad = async (req, res) => {
  try {
    res.render('addNewUser.ejs')
  } catch (error) {
    console.log(error)
  }
}

//Add new user =>
const addUser = async (req, res) => {
  try {
    const { name, email } = req.body
    const image = req.file.filename
    const password = randomstring.generate(7)
    console.log(password)
    const sPassword = await securePassword(password)
    console.log(sPassword)
    const user = new User({
      name,
      email,
      image: image,
      password: sPassword,
      is_admin: 0,
    })
    const userData = await user.save()
    if (userData) {
      console.log('data')
      addUserMail(userData.name, userData.email, password, userData._id)
      res.redirect('/admin/dashboard')
    } else {
      res.render('addNewUser.ejs', { massage: 'Something Wrong' })
    }
  } catch (error) {
    console.log(error)
  }
}

//Load Edit User =>
const editUser = async (req, res) => {
  try {
    const id = req.query.id
    const userData = await User.findById({ _id: id })
    if (userData) {
      res.render('editByAdmin.ejs', { user: userData })
    } else {
      res.redirect('/admin/dashboard')
    }
  } catch (error) {
    console.log(error)
  }
}

// Edit and Updata User
const updateUsers = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          is_verified: req.body.verify,
        },
      },
    )
    res.redirect('/admin/dashboard')
  } catch (error) {
    console.log(error)
  }
}

// Delete User
const deleteUser = async (req, res) => {
  try {
    const id = req.query.id
    const Delete = await User.deleteOne({ _id: id })
    res.redirect('/admin/dashboard')
  } catch (error) {
    console.log(error)
  }
}

// Export  User Data
const exportUser = async (req, res) => {
  try {
    const workbook = new excelJS.Workbook()
    const worksheet = workbook.addWorksheet('My Users')
    worksheet.columns = [
      {
        header: 'S.No.',
        key: 's_no',
      },
      { header: 'Name', key: 'name' },
      { header: 'Email', key: 'email' },
      { header: 'Image', key: 'image' },
      { header: 'is_Verified', key: 'is_verified' },
    ]

    let counter = 1
    const userData = await User.find({ is_admin: 0 })
    userData.forEach((user) => {
      user.s_no = counter

      worksheet.addRow(user)

      counter++
    })
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
    })
    res.setHeader(
      'Content-type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )

    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx')

    return workbook.xlsx.write(res).then(() => {
      res.status(200)
    })
  } catch (error) {
    console.log(error)
  }
}

// Export UserData into pdf PDF
const exportUserPDF = async (req, res) => {
  try {
    const users = await User.find({ is_admin: 0 })
    console.log(users)
    const data = {
      users: users,
    }
    const filePathName = path.resolve(__dirname, +'/views/html/htmltoPDF')
    console.log(filePathName)

    const htmlString = fs.readFileSync(filePathName).toString()
    console.log(htmlString, "htmlstring")
    const ejsData = ejs.render(htmlString, data)

    console.log("ejs", ejsData)
    let options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
    }
    pdf.create(ejsData, options).toFile('users.pdf', (err, response) => {
      if (err) console.log(err)

      const filePath = path.resolve(__dirname, '.../users.pdf')
      fs.readFile(filePath, (err, file) => {
        if (err) {
          console.log("ifs")
          console.log(err)
          return res.status(500).send('Could not Download File ')
        }

        res.setHeader('Content-type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment;filename="users.pdf"')
        res.send(file)
      })
    })
  } catch (error) {
    console.log("catch error")
    console.log(error)
  }
}

// Module Exports
module.exports = {
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
}
