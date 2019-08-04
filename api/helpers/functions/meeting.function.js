const pg = require('pg')
const connectionString = process.env.DATABASE_URL
const client = new pg.Client(connectionString)
client.connect()

exports.meetingExists = async meetingId => {
  let length
  await client
    .query(`SELECT * FROM MEETINGS M WHERE M.id=` + meetingId)
    .then(results => (length = results.rows.length))
    .catch(err => console.log(err))

  if (length === 1) {
    return true
  }
  return false
}

exports.checkMeetingDate = async (res, date) => {
  let today = new Date()
  let currentDay = today.getDate()
  let currentMonth = today.getMonth() + 1
  let currentYear = today.getFullYear()
  if (currentDay < 10) {
    currentDay = '0' + currentDay
  }
  if (currentMonth < 10) {
    currentMonth = '0' + currentMonth
  }
  currentDate = currentYear + '-' + currentMonth + '-' + currentDay
  if (currentDate < date) {
    return true
  } else {
    res.json('Date is behind')
    return false
  }
}

exports.editTask = async (res, meetingId, dataToEdit) => {
  let noEditData = []
  for (let i = 0; i < dataToEdit.length; i++) {
    switch (dataToEdit[i][0]) {
      case 'meetingTitle':
      case 'location':
      case 'date':
        await client.query(
          `UPDATE MEETINGS M SET ` +
            dataToEdit[i][0]`='` +
            dataToEdit[i][1] +
            "'" +
            `  WHERE M.id=` +
            meetingId
        )
      default:
        noEditData += dataToEdit[i][0]
    }
  }
  if (noEditData.length === 0) {
    res.json('Meeting updated successfully')
  } else {
    res.json(noEditData + ' can not be edited')
  }
}

exports.checkMeetingConfirmationStatus = async meetingId => {
  let meetingConfirmation
  await client
    .query(`SELECT * FROM MEETINGS M WHERE M.id=` + meetingId)
    .then(results => (meetingConfirmation = results.rows[0].confirmed))
    .catch(err => console.log(err))
  if (meetingConfirmation) {
    return true
  }
  return false
}

exports.confirmMeeting = async (res, meetingId) => {
  await client.query(
    `UPDATE MEETINGS M SET confirmed =` +
      confirmed +
      `  WHERE M.id=` +
      meetingId
  )
  res.json('Meeting confirmed successfully')
}

exports.checkAttendeeConfirmation = async (attendeeId, meetingId) => {
  let userConfirmationStatus
  await client
    .query(
      `SELECT * FROM TaskMeetings TM WHERE TM.meeting_id=` +
        meetingId +
        ` AND TM.attendee_id=` +
        attendeeId
    )
    .then(results => (userConfirmationStatus = results.rows[0].confirmation))
    .catch(err => console.log(err))
  if (userConfirmationStatus) {
    return true
  }
  return false
}

exports.attendingMeeting = async (res, attendeeId, meetingId, status) => {
  await client.query(
    `UPDATE TaskMeetings TM SET confirmation =` +
      status +
      `  WHERE TM.meeting_id=` +
      meetingId +
      ` AND TM.attendee_id=` +
      attendeeId
  )
  res.json('Confirmation staus has been updated')
}

exports.createMeeting = async (
  res,
  meetingTitle,
  location,
  date,
  organizer
) => {
  let id
  await client
    .query(`SELECT id FROM MEETINGS ORDER BY id DESC LIMIT 1`)
    .then(results =>
      results.rows.length === 0 ? (id = 0) : (id = results.rows[0].id)
    )
    .catch(err => console.log(err))

  id += 1

  await client
    .query(
      ` INSERT INTO MEETINGS VALUES (` +
        id +
        `,` +
        "'" +
        meetingTitle +
        "'," +
        "'" +
        location +
        "'," +
        "'" +
        date +
        "'," +
        "'" +
        organizer +
        "'" +
        `)`
    )
    .then(() =>
      client
        .query(
          `SELECT id,meeting_title,location,date,organizer FROM MEETINGS M WHERE M.id=` +
            "'" +
            id +
            "'"
        )
        .then(results => res.status(200).json(results.rows))
        .catch(err => console.log(err))
    )
}
