const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const { roles } = require('../roles')

//hash password
const hashPassword = async password => {
  return await bcrypt.hash(password, 10)
}

//validation of password
const validatePassword = async (plainPassword, hashedPaassword) => {
  return await bcrypt.compare(plainPassword, hashedPaassword)
}

//--------------------------------------sigup for users------------------------------------------------------------------------
const signUp = async (req, res, next) => {
  try {
    const { email, password, role } = req.body
    const hashedPassword = await hashPassword(password)
    const newUser = new User({ email: email, password: hashedPassword, role: role || 'basic' })
    const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })
    newUser.accessToken = accessToken
    //save the new User
    await newUser.save()
    res.json({
      data: newUser,
      accessToken,
    })
  } catch (err) {
    next(err)
  }
}
//--------------------------------------login for users------------------------------------------------------------------------
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return next(new Error('Email does not exist'))
    const validPassword = await validatePassword(password, user.password)
    if (!validPassword) return next(new Error('Either password or email is not correct'))
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })
    await User.findByIdAndUpdate(user._id, { accessToken })
    res.status(200).json({
      data: { email: user.email, role: user.role },
      accessToken,
    })
  } catch (err) {
    next(err)
  }
}

//--------------------------------------get users------------------------------------------------------------------------
const getUsers = async (req, res, next) => {
  const users = await User.find({})
  res.status(200).json({
    data: users,
  })
}

//--------------------------------------getUser ------------------------------------------------------------------------
const getUser = async (req, res, next) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)
    if (!user) return next(new Error('User does not exist'))
    res.status(200).json({
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

//--------------------------------------update  users------------------------------------------------------------------------
const updateUser = async (req, res, next) => {
  try {
    const update = req.body
    const userId = req.params.userId
    await User.findByIdAndUpdate(userId, update)
    const user = await User.findById(userId)
    res.status(200).json({
      data: user,
      message: 'User has been updated',
    })
  } catch (error) {
    next(error)
  }
}

//--------------------------------------delete for users------------------------------------------------------------------------
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId
    await User.findByIdAndDelete(userId)
    res.status(200).json({
      data: null,
      message: 'User has been deleted',
    })
  } catch (error) {
    next(error)
  }
}

//--------------------------------------middleware for granting access---------------------------------------------------------------
const grantAccess = (action, resource) => {
  return async (req, res, next) => {
    try {
      const permission = roles.can(req.user.role)[action](resource)
      if (!permission.granted) {
        return res.status(401).json({
          error: "You don't have enough permission to perform this action",
        })
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
const allowIfLoggedIn = async (req, res, next) => {
  try {
    const user = res.locals.loggedInUser
    if (!user)
      return res.status(401).json({
        error: 'You need to be logged in to access this route',
      })
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}
module.exports = { signUp, login, getUsers, deleteUser, grantAccess, allowIfLoggedIn, updateUser, getUser }
