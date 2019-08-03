const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
let store = require('store')
const tokenKey = require('../../../config/keys').secretOrKey
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

exports.checkAccount = async (res, email, password) => {
  let length
  let userPassword
  await client
    .query(`SELECT * FROM USERS U  WHERE U.email=` + "'" + email + "'")
    .then(results => [
      (length = results.rows.length),
      (userPassword = results.rows[0].password)
    ])
    .catch(err => console.log(err))

  if (length === 1) {
    if (bcrypt.compareSync(password, userPassword)) {
      return true
    } else {
      res.json({
        header: {
          statusCode: '0104',
          timestamp: new Date()
        }
      })
    }
  } else {
    res.json({
      header: {
        statusCode: '0105',
        timestamp: new Date()
      }
    })
    return false
  }
}

exports.getUserId = async email => {
  let length
  let userId
  await client
    .query(`SELECT * FROM USERS U  WHERE U.email=` + "'" + email + "'")
    .then(results => [
      (length = results.rows.length),
      (userId = results.rows[0].id)
    ])
    .catch(err => console.log(err))

  if (length === 1) {
    return userId
  }
  return null
}

exports.checkUser = async userId => {
  let length
  await client
    .query(`SELECT * FROM USERS U  WHERE U.id=` + userId)
    .then(results => (length = results.rows.length))
    .catch(err => console.log(err))

  if (length === 1) {
    return true
  }
  return false
}

exports.checkSuspension = async (res, userId) => {
  let suspension
  await client
    .query(`SELECT * FROM USERS U WHERE U.id=` + userId)
    .then(results => (suspension = results.rows[0].suspended))
    .catch(err => console.log(err))
  if (suspension) {
    return true
  }
  return false
}

exports.userSuspension = async (userId, status) => {
  await client.query(
    `UPDATE USERS U SET suspended =` +
      status +
      `  WHERE U.id=` +
      "'" +
      userId +
      "'"
  )
}

exports.signin = async (res, email) => {
  let userId
  await client
    .query(`SELECT * FROM USERS U  WHERE U.email=` + "'" + email + "'")
    .then(results => (userId = results.rows[0].id))
    .catch(err => console.log(err))

  const payload = {
    id: userId
  }
  const token = jwt.sign(payload, tokenKey, { expiresIn: '1h' })
  store.set('token', token)
  await res.json({ token: `Bearer ${token}` })
}
