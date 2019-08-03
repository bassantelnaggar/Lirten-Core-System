const userFunctions = require('../helpers/functions/user.function')

exports.get_users = async res => {
  userFunctions.getUsers(res)
}

exports.signup = async (req, res) => {
  const { username, email, password } = req.body
  if (await userFunctions.checkUsername(username)) {
    if (await userFunctions.checkEmail(email)) {
      if (await userFunctions.checkPassword(password)) {
        await userFunctions.createUser(res, username, email, password)
      } else {
        res.json({
          header: {
            statusCode: '0103',
            timestamp: new Date()
          }
        })
      }
    } else {
      res.json({
        header: {
          statusCode: '0102',
          timestamp: new Date()
        }
      })
    }
  } else {
    res.json({
      header: {
        statusCode: '0101',
        timestamp: new Date()
      }
    })
  }
}
