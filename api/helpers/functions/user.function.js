const pg = require('pg')
const connectionString = process.env.DATABASE_URL
const client = new pg.Client(connectionString)
client.connect()

exports.getUsers = (req, res) => {
  client.query(`SELECT * FROM USERS `, (err, results) => {
    if (err) {
      throw err
    }
    return res.status(200).json(results.rows)
  })
}

exports.checkUsername = username => {
  client.query(
    `SELECT * FROM USERS U  WHERE U.username=` + "'" + username + "'",
    (err, results) => {
      if (err) {
        throw err
      }
      if (results.rows.length === 0) return true
      else return false
    }
  )
}

exports.checkEmail = email => {
  client.query(
    `SELECT * FROM USERS U  WHERE U.email=` + "'" + email + "'",
    (err, results) => {
      if (err) {
        throw err
      }
      if (results.rows.length === 0) {
        return true
      }
      return false
    }
  )
}

exports.createUser = (req, res, username, email, password) => {
  const id = client.query(`SELECT id FROM  USERS ORDER BY id DESC  LIMIT 1`)
  client.query(
    ` INSERT INTO USERS VALUES (` +
      id`,` +
      "'" +
      username +
      "'," +
      "'" +
      email +
      "'," +
      "'" +
      password +
      "'" +
      `)`,
    (err, results) => {
      if (err) {
        throw err
      }
      return res.status(200).json(results.rows)
    }
  )
}
