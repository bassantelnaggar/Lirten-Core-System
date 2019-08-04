const express = require('express')
const router = express.Router()
const meetingController = require('../controllers/meeting.controller')

router.post('/createMeeting/v1', meetingController.createMeeting)
router.post('/editMeeting/v1', meetingController.editMeeting)
router.post('/confirmAttending/v1', meetingController.confirmAttending)

module.exports = router
