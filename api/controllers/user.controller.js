const { getUsers } = require('../helpers/functions/user.function')
const pg = require('pg')
const connectionString = process.env.DATABASE_URL
const client = new pg.Client(connectionString)
client.connect()

exports.get_users = async (req, res) => {
  client.query(getUsers, (err, results) => {
    if (err) {
      throw err
    }
    res.status(200).json(results.rows)
  })
}
