require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = express()
const PORT = process.env.PORT || 3000
const usersRouter = require('./routes/user')
const User = require('./models/User')

//connceting to database

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => console.log(`-----Database connected successfully-------`))
  .catch(e => console.log(e))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(async (req, res, next) => {
  if (req.headers['x-access-token']) {
    const accessToken = req.headers['x-access-token']
    const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET)
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({
        error: 'JWT token has expired, please login to obtain a new one',
      })
    }
    res.locals.loggedInUser = await User.findById(userId)
    next()
  } else {
    next()
  }
})

app.use('/', usersRouter)

//start listening on the server
app.listen(PORT, () => console.log(`-------Server is up and running-----`))
