const userFunctions = require('../helpers/functions/user.function')
const pg = require('pg')
const connectionString = process.env.DATABASE_URL
const client = new pg.Client(connectionString)
client.connect()

exports.get_users = async (req, res) => {
  client.query(userFunctions.getUsers, (err, results) => {
    if (err) {
      throw err
    }
    res.status(200).json(results.rows)
  })
}

exports.check_username = async (req, res) => {
  const { username, email, password } = req.body
  client.query(
    userFunctions.createUser(username, email, password),
    (err, results) => {
      if (err) {
        throw err
      }
      if (results.rows.length !== 0) {
        res.status(200).json(results.rows)
      } else {
        res.send('No data matching!')
      }
    }
  )
}
