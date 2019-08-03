const userFunctions = require('../helpers/functions/user.function')
const pg = require('pg')
const connectionString = process.env.DATABASE_URL
const client = new pg.Client(connectionString)
client.connect()

exports.get_users = async (req, res) => {
  userFunctions.getUsers(req, res)
}

exports.check_username = async (req, res) => {
  const { username, email, password } = req.body
  if (!userFunctions.checkUsername(username)) {
    console.log('nooo')
    if (!userFunctions.checkEmail(email)) {
      userFunctions.createUser(req, res, username, email, password)
    }
  }
}
