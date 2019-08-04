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
