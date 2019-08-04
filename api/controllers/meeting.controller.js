const meetingFunctions = require('../helpers/functions/meeting.function')
const taskFunctions = require('../helpers/functions/task.function')
const userFunctions = require('../helpers/functions/user.function')

exports.createMeeting = async (req, res) => {
  const { meetingTitle, location, date, organizer, userTasks } = req.body
  if (await meetingFunctions.checkMeetingDate(res, date)) {
    const meetingId = await meetingFunctions.createMeeting(
      meetingTitle,
      location,
      date,
      organizer
    )
    await userTasks.map(async condition => {
      if (await userFunctions.checkUser(condition.attendeeId)) {
        if (!(await userFunctions.checkSuspension(res, condition.attendeeId))) {
          if (
            await taskFunctions.checkUserTask(
              condition.taskId,
              condition.attendeeId
            )
          ) {
            await meetingFunctions.organizeMeeting(
              res,
              meetingId,
              condition.taskId,
              condition.attendeeId
            )
          }
        }
      }
    })
  }
}

exports.editMeeting = async (req, res) => {
  const { meetingId, dataToEdit } = req.body
  if (await meetingFunctions.meetingExists(meetingId)) {
    if (
      !(await meetingFunctions.checkMeetingConfirmationStatus(res, meetingId))
    ) {
      await meetingFunctions.editMeeting(res, meetingId, dataToEdit)
    }
  }
}

exports.confirmAttending = async (req, res) => {
  const { meetingId, attendeeId, confirmed } = req.body
  await meetingFunctions.attendingMeeting(res, attendeeId, meetingId, confirmed)
}
