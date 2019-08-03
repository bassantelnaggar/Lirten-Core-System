const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

router.post('/get', userController.get_users)
router.post('/check', userController.check_username)

module.exports = router
