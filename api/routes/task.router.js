const express = require('express')
const router = express.Router()
const taskController = require('../controllers/task.controller')

router.post('/createTask/v1', taskController.createTask)
router.post('/viewTaskList/v1', taskController.viewTaskList)
router.post('/viewMyTasks/v1', taskController.viewMyTasks)
router.post('/freezeTask/v1', taskController.freezeTask)
router.post('/applyTask/v1', taskController.applyTask)
router.post('/acceptApplicant/v1', taskController.acceptApplicant)
router.post('/submitTask/v1', taskController.submitTask)
router.post('/confirmTask/v1', taskController.confirmTask)
router.post('/editTask/v1', taskController.editTask)
router.post('/sortFilteredTasks/v1', taskController.sortFilteredTasks)

module.exports = router
