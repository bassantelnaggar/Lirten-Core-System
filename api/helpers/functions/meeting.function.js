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
    res.json({
      header: {
        statusCode: '0302',
        timestamp: new Date()
      }
    })
    return false
  }
}

exports.editMeeting = async (res, meetingId, dataToEdit) => {
  let noEditData = []
  for (let i = 0; i < dataToEdit.length; i++) {
    if (
      dataToEdit[i][0] === 'meeting_title' ||
      dataToEdit[i][0] === 'date' ||
      dataToEdit[i][0] === 'location'
    ) {
      await client.query(
        `UPDATE MEETINGS M SET ` +
          dataToEdit[i][0] +
          `='` +
          dataToEdit[i][1] +
          "'" +
          `  WHERE M.id=` +
          meetingId
      )
    } else {
      noEditData += dataToEdit[i][0]
    }
  }
  if (noEditData.length === 0) {
    res.json({
      header: {
        statusCode: '0000',
        requestId: 'A-123',
        timestamp: new Date()
      },
      body: {
        message: 'Meeting updated successfully'
      }
    })
  } else {
    res.json({
      header: {
        statusCode: '0215',
        timestamp: new Date()
      }
    })
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

exports.confirmMeeting = async (res, meetingId, status) => {
  await client.query(
    `UPDATE MEETINGS M SET confirmed = ` + status + `  WHERE M.id=` + meetingId
  )
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
  res.json({
    header: {
      statusCode: '0000',
      requestId: 'A-123',
      timestamp: new Date()
    },
    body: {
      message: 'Confirmation staus has been updated'
    }
  })
}

exports.createMeeting = async (meetingTitle, location, date, organizer) => {
  let id
  let length
  let meetingId
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
    .then(async () => {
      await client
        .query(`SELECT * FROM MEETINGS M  WHERE M.id=` + "'" + id + "'")
        .then(results => [
          (length = results.rows.length),
          (meetingId = results.rows[0].id)
        ])
        .catch(err => console.log(err))
    })
  if (length === 1) {
    return meetingId
  }
  return null
}

exports.organizeMeeting = async (res, meetingId, taskId, attendeeId) => {
  await client
    .query(
      ` INSERT INTO TaskMeetings VALUES (` +
        taskId +
        `,` +
        "'" +
        meetingId +
        "'," +
        "'" +
        attendeeId +
        "'" +
        `)`
    )
    .then(() =>
      client
        .query(
          `SELECT task_id,meeting_id,attendee_id FROM TaskMeetings TM WHERE TM.meeting_id=` +
            "'" +
            meetingId +
            "'" +
            ` AND TM.attendee_id=` +
            attendeeId
        )
        .then(results =>
          res.json({
            header: {
              statusCode: '0000',
              requestId: 'A-123',
              timestamp: new Date()
            },
            body: {
              user: results.rows
            }
          })
        )
        .catch(err => console.log(err))
    )
}

exports.attendeeNumber = async meetingId => {
  let invitedUsers
  let confirmedUsers
  await client
    .query(`SELECT * FROM TASKMEETINGS WHERE meeting_id= ` + meetingId)
    .then(results => (invitedUsers = results.rows.length))
    .catch(err => console.log(err))

  await client
    .query(
      `SELECT * FROM TASKMEETINGS WHERE meeting_id= ` +
        meetingId +
        ` AND confirmation= true`
    )
    .then(async results => (confirmedUsers = results.rows.length))
    .catch(err => console.log(err))

  if (invitedUsers === confirmedUsers) return true
  else return false
}
