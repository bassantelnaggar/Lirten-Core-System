const meetingFunctions = require('../helpers/functions/meeting.function')
const taskFunctions = require('../helpers/functions/task.function')
const userFunctions = require('../helpers/functions/user.function')

exports.getMeetings = async (req, res) => {
  meetingFunctions.getMeetings(res)
}

exports.createMeeting = async (req, res) => {
  const { meetingTitle, location, date, organizer, userTasks } = req.body.body
  if (await meetingFunctions.checkMeetingDate(res, date)) {
    if (await userFunctions.checkUser(res, organizer)) {
      if (await userFunctions.checkSuspension(res, organizer)) {
        const meetingId = await meetingFunctions.createMeeting(
          meetingTitle,
          location,
          date,
          organizer
        )
        await userTasks.map(async condition => {
          if (await userFunctions.checkUser(res, condition.attendeeId)) {
            if (
              await userFunctions.checkSuspension(res, condition.attendeeId)
            ) {
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
  }
}

exports.editMeeting = async (req, res) => {
  const { meetingId, dataToEdit } = req.body.body
  if (await meetingFunctions.meetingExists(meetingId)) {
    if (
      !(await meetingFunctions.checkMeetingConfirmationStatus(res, meetingId))
    ) {
      await meetingFunctions.editMeeting(res, meetingId, dataToEdit)
    }
  }
}

exports.confirmAttending = async (req, res) => {
  const { meetingId, attendeeId, confirmed } = req.body.body
  if (await userFunctions.checkUser(res, attendeeId)) {
    if (await userFunctions.checkSuspension(res, attendeeId)) {
      await meetingFunctions.attendingMeeting(
        res,
        attendeeId,
        meetingId,
        confirmed
      )
    }
    if (await meetingFunctions.attendeeNumber(meetingId)) {
      await meetingFunctions.confirmMeeting(res, meetingId, true)
    } else {
      await meetingFunctions.confirmMeeting(res, meetingId, false)
    }
  }
}
