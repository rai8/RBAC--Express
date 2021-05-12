const mongoose = require('mongoose')

const { Schema } = mongoose

//define the user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'Basic',
    enum: ['basic', 'supervisor', 'admin'],
  },
  accessToken: {
    type: String,
  },
})

//defining the model
const User = mongoose.model('user', userSchema)
module.exports = User
