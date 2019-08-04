const userFunctions = require('../helpers/functions/user.function')

exports.get_users = async (req, res) => {
  userFunctions.getUsers(res)
}

exports.signup = async (req, res) => {
  const { username, email, password } = req.body.body
  if (await userFunctions.checkUsername(res, username)) {
    if (await userFunctions.checkEmail(res, email)) {
      if (await userFunctions.checkPassword(res, password)) {
        await userFunctions.createUser(res, username, email, password)
      }
    }
  }
}

exports.signin = async (req, res) => {
  const { email, password } = req.body.body
  if (await userFunctions.checkAccount(res, email, password)) {
    const userId = await userFunctions.getUserId(email)
    if (await userFunctions.checkSuspension(res, userId)) {
      await userFunctions.signin(res, email)
    }
  }
}

exports.suspendUser = async (req, res) => {
  const { userId, status } = req.body.body
  if (await userFunctions.checkUser(userId)) {
    if (status) {
      if (await userFunctions.checkAlreadySuspended(res, userId)) {
        await userFunctions.userSuspension(res, userId, status)
      }
    } else {
      if (await userFunctions.checkAlreadyUnsuspended(res, userId)) {
        await userFunctions.userSuspension(res, userId, status)
      }
    }
  }
}
