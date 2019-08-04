const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
let store = require('store')
const tokenKey = require('../../../config/keys').secretOrKey
const pg = require('pg')
const connectionString = process.env.DATABASE_URL
const client = new pg.Client(connectionString)
client.connect()

exports.getUsers = res => {
  client
    .query(`SELECT * FROM USERS `)
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
}

exports.checkUsername = async (res, username) => {
  let length
  await client
    .query(`SELECT * FROM USERS U  WHERE U.username=` + "'" + username + "'")
    .then(results => (length = results.rows.length))
    .catch(err => console.log(err))

  if (length === 0) {
    return true
  }
  res.json({
    header: {
      statusCode: '0101',
      timestamp: new Date()
    }
  })
  return false
}

exports.checkEmail = async (res, email) => {
  let length
  await client
    .query(`SELECT * FROM USERS U  WHERE U.email=` + "'" + email + "'")
    .then(results => (length = results.rows.length))
    .catch(err => console.log(err))

  if (length === 0) {
    return true
  }
  res.json({
    header: {
      statusCode: '0102',
      timestamp: new Date()
    }
  })
  return false
}

exports.checkPassword = (res, password) => {
  if (password.length < 8) {
    res.json({
      header: {
        statusCode: '0103',
        timestamp: new Date()
      }
    })
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
    .then(results =>
      results.rows.length === 0 ? (id = 0) : (id = results.rows[0].id)
    )
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
  if (!suspension) {
    return true
  } else {
    res.json({
      header: {
        statusCode: '0106',
        timestamp: new Date()
      }
    })
    return false
  }
}

exports.checkAlreadySuspended = async (res, userId) => {
  let suspension
  await client
    .query(`SELECT * FROM USERS U WHERE U.id=` + userId)
    .then(results => (suspension = results.rows[0].suspended))
    .catch(err => console.log(err))
  if (!suspension) {
    return true
  } else {
    res.json({
      header: {
        statusCode: '0108',
        timestamp: new Date()
      }
    })
    return false
  }
}

exports.checkAlreadyUnsuspended = async (res, userId) => {
  let suspension
  await client
    .query(`SELECT * FROM USERS U WHERE U.id=` + userId)
    .then(results => (suspension = results.rows[0].suspended))
    .catch(err => console.log(err))
  if (suspension) {
    return true
  } else {
    res.json({
      header: {
        statusCode: '0109',
        timestamp: new Date()
      }
    })
    return false
  }
}

exports.userSuspension = async (res, userId, status) => {
  await client.query(
    `UPDATE USERS U SET suspended =` + status + `  WHERE U.id=` + userId
  )
  res.json({
    header: {
      statusCode: '0000',
      requestId: 'A-123',
      timestamp: new Date()
    },
    body: {
      message: 'Suspension status has been updated successfully'
    }
  })
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
  await res.json({
    header: {
      statusCode: '0000',
      requestId: 'A-123',
      timestamp: new Date()
    },
    body: {
      token: `Bearer ${token}`
    }
  })
}
