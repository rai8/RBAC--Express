const express = require('express')
const router = express.Router()
const {
  signUp,
  login,
  deleteUser,
  allowIfLoggedIn,
  getUsers,
  getUser,
  grantAccess,
  updateUser,
} = require('../controllers/userController')

//defined routes for users
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Role Base Access Control' })
})
router.post('/signup', signUp)
router.post('/login', login)
router.get('/user/:userId', allowIfLoggedIn, getUser)
router.get('/users', allowIfLoggedIn, grantAccess('readAny', 'profile'), getUsers)

router.put('/user/:userId', allowIfLoggedIn, grantAccess('updateAny', 'profile'), updateUser)

router.delete('/user/:userId', allowIfLoggedIn, grantAccess('deleteAny', 'profile'), deleteUser)

module.exports = router
