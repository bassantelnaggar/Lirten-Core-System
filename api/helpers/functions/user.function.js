const bcrypt = require('bcryptjs')
const pg = require('pg')
const connectionString = process.env.DATABASE_URL
const client = new pg.Client(connectionString)
client.connect()

exports.getUsers = res => {
  client.query(`SELECT * FROM USERS `, (err, results) => {
    if (err) {
      throw err
    }
    return res.status(200).json(results.rows)
  })
}

exports.checkUsername = async username => {
  let length
  await client
    .query(`SELECT * FROM USERS U  WHERE U.username=` + "'" + username + "'")
    .then(results => (length = results.rows.length))
    .catch(err => console.log(err))

  if (length === 0) {
    return true
  }
  return false
}

exports.checkEmail = async email => {
  let length
  await client
    .query(`SELECT * FROM USERS U  WHERE U.email=` + "'" + email + "'")
    .then(results => (length = results.rows.length))
    .catch(err => console.log(err))

  if (length === 0) {
    return true
  }
  return false
}

exports.checkPassword = password => {
  if (password.length < 8) {
    return false
  }
  return true
}

exports.createUser = async (res, username, email, password) => {
  let id
  const salt = bcrypt.genSaltSync(10)
  const cryptedPassword = bcrypt.hashSync(password, salt)
  await client
    .query(`SELECT id FROM  USERS ORDER BY id DESC LIMIT 1`)
    .then(results => (id = results.rows[0].id))
    .catch(err => console.log(err))

  id += 1

  await client
    .query(
      ` INSERT INTO USERS VALUES (` +
        id +
        `,` +
        "'" +
        username +
        "'," +
        "'" +
        email +
        "'," +
        "'" +
        cryptedPassword +
        "'" +
        `)`
    )
    .then(() =>
      client
        .query(
          `SELECT id,username,email FROM USERS U WHERE U.id=` + "'" + id + "'"
        )
        .then(results => res.status(200).json(results.rows))
        .catch(err => console.log(err))
    )
}
