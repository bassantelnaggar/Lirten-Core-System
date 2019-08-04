const meetingFunctions = require('../helpers/functions/meeting.function')

exports.createMeeting = async (req, res) => {
  const { meetingTitle, location, date, organizer } = req.body
  if (await meetingFunctions.checkMeetingDate(res, date)) {
    await meetingFunctions.createMeeting(
      res,
      meetingTitle,
      location,
      date,
      organizer
    )
  }
}

exports.confirmAttending = async (req, res) => {
  const { meetingId, attendeeId, confirmed } = req.body
  await meetingFunctions.confirmAttending(attendeeId, meetingId, confirmed)
}
