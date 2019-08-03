const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

router.post('/get/v1', userController.get_users)
router.post('/signup/v1', userController.signup)
router.post('/signin/v1', userController.signin)
router.post('/suspendUser/v1', userController.suspendUser)

module.exports = router
