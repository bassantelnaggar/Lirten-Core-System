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

exports.signin = async (req, res) => {
  const { email, password } = req.body
  if (await userFunctions.checkAccount(res, email, password)) {
    const userId = await userFunctions.getUserId(email)
    if (!(await userFunctions.checkSuspension(res, userId))) {
      await userFunctions.signin(res, email)
    } else {
      res.json('Account Suspended')
    }
  }
}

exports.suspendUser = async (req, res) => {
  const { userId, status } = req.body
  if (await userFunctions.checkUser(userId)) {
    if (status) {
      if (!(await userFunctions.checkSuspension(res, userId))) {
        await userFunctions.userSuspension(userId, status)
        res.json('Account suspended successfully')
      } else {
        res.json('Account already unsuspended')
      }
    } else {
      if (await userFunctions.checkSuspension(res, userId)) {
        await userFunctions.userSuspension(userId, status)
        res.json('Account unsuspended successfully')
      } else {
        res.json('Account already unsuspended')
      }
    }
  }
}
